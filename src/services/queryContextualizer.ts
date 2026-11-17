import { SchoolTypeScope, ClarifyingQuestion } from '../types/almanach';

export interface ContextualizedQuery {
  originalQuery: string;
  embeddingQuery: string;
  expandedTerms: string[];
  contextSummary: string;
  effectiveSchoolScope: SchoolTypeScope;
  usedAiRewrite: boolean;
  clarifyingQuestions: ClarifyingQuestion[];
}

const rewriteCache = new Map<string, ContextualizedQuery>();

const LOCAL_REWRITE_RULES: Array<{
  pattern: RegExp;
  terms: string[];
  label?: string;
}> = [
  {
    pattern: /\b(\d+\s*[- ]?\s*5(?:er|en)?|fünf(?:en)?|note\s*5)\b/i,
    terms: ['mangelhaft', 'zwei mangelhafte', 'note mangelhaft', 'ausgleich', 'nichtversetzung'],
    label: 'Mangelhafte Noten (Note 5)',
  },
  {
    pattern: /\b(\d+\s*[- ]?\s*6(?:er|en)?|sechs(?:en)?|note\s*6)\b/i,
    terms: ['ungenügend', 'note ungenügend', 'ausgleich', 'nichtversetzung'],
    label: 'Ungenügende Note (Note 6)',
  },
  {
    pattern: /versetz|aufrück|sitzenbleib|durchfall|wiederhol|ehrenrunde|nichtversetz/i,
    terms: ['versetzung', 'versetzt', 'aufrücken', 'ausgleich', 'wiederholung', 'klassenkonferenz', '§ 51 ThürSchulO', '§ 49 ThürSchulG'],
    label: 'Versetzung & Wiederholung',
  },
  {
    pattern: /ausgleich|ausgleichs/i,
    terms: ['ausgleich', 'ausgleichen', 'mangelhaft', 'ungenügend', 'befriedigend'],
  },
  {
    pattern: /schläg|prügel|tätlich|angriff|gewalt|rauferei|bedroh|waffe|messer/i,
    terms: ['ordnungsmaßnahme', 'gewalt', 'schulfrieden', 'pädagogische maßnahmen', '§ 51 ThürSchulG', 'hausrecht', 'dienstanweisung gewalt'],
    label: 'Ordnungsmaßnahmen & Gewaltprävention',
  },
  {
    pattern: /suspendier|ausschließ|ausschluss|verweis|tadel/i,
    terms: ['ordnungsmaßnahme', 'unterrichtsausschluss', 'schriftlicher verweis', '§ 51 ThürSchulG', 'klassenkonferenz'],
    label: 'Ordnungsmaßnahmen (§ 51 ThürSchulG)',
  },
  {
    pattern: /klassenarbeit|leistungsnachweis|test|note|noten|bewert|täusch|spick|plagiat/i,
    terms: ['leistungsnachweis', 'klassenarbeit', 'leistungsbewertung', 'tageslimit', 'ankündigung', 'täuschung'],
    label: 'Leistungsbewertung & Klassenarbeiten',
  },
  {
    pattern: /handy|smartphone|tablet|ipad|foto|video|whatsapp|messenger/i,
    terms: ['datenschutz', 'einwilligung', 'handy', 'ranzen', 'endgeräte', 'thürdsg'],
    label: 'Datenschutz & Endgeräte',
  },
  {
    pattern: /klassenfahrt|wandertag|ausflug|freiplatz|bus|baden|schwimmen|skilager/i,
    terms: ['wandertage', 'klassenfahrten', 'freiplatz', 'aufsicht', 'dienstreise', 'schulsport'],
    label: 'Wandertage & Klassenfahrten',
  },
  {
    pattern: /lrs|legasthenie|dyskalkulie|nachteilsausgleich|notenschutz|zeitzugabe/i,
    terms: ['nachteilsausgleich', 'notenschutz', 'rechtschreibung', 'zeugnisvermerk', 'förderplan'],
    label: 'Nachteilsausgleich & Notenschutz',
  },
  {
    pattern: /medikament|asthma|allergie|diabetes|insulin|epipen|adrenalin|unfall|verletz/i,
    terms: ['medikamentengabe', 'notfallmedikation', 'unfall', 'verbandbuch', 'ukt'],
    label: 'Medikamentengabe & Unfallschutz',
  },
  {
    pattern: /gefahrstoff|chemikalie|schutzbrille|labor|abzug|laser|werken/i,
    terms: ['risu', 'degintu', 'schutzbrille', 'gefahrstoff', 'sicherheit'],
    label: 'Sicherheit im Fachunterricht (RiSU)',
  },
  {
    pattern: /schwänz|unentschuldigt|schuldistanz|fehlt|fehlzeit/i,
    terms: ['schuldistanz', 'schulpflicht', 'schulzwang', 'fehlzeiten'],
    label: 'Schulpflicht & Schuldistanz',
  },
  {
    pattern: /geschenk|blumen|gutschein|praline|schokolade/i,
    terms: ['geschenke', 'belohnungen', 'korruption', 'wertgrenze', '§ 42 BeamtStG'],
    label: 'Korruptionsprävention & Geschenke',
  },
  {
    pattern: /kindeswohl|gefährdung|missbrauch|vernachlässig|jugendamt|isef/i,
    terms: ['kindeswohlgefährdung', '§ 8a SGB VIII', 'isef', 'jugendamt', 'schutzkonzept', 'checkliste'],
    label: 'Kinderschutz (§ 8a SGB VIII)',
  },
];

export function detectExplicitSchoolScope(query: string, defaultScope: SchoolTypeScope): SchoolTypeScope {
  const q = query.toLowerCase();
  if (/\bgrundschule\b|\bprimarstufe\b|\bschuleingangsphase\b/.test(q)) return 'all';
  if (/\bgymnasiale oberstufe\b|\babitur\b|\bkursphase\b|\beinführungsphase\b/.test(q)) return 'all';
  if (/\bgemeinschaftsschule\b|\btgs\b/.test(q)) return 'tgs';
  return defaultScope;
}

export function contextualizeQueryLocally(
  rawQuery: string,
  schoolScope: SchoolTypeScope = 'regelschule'
): ContextualizedQuery {
  const clean = rawQuery.trim();
  const effectiveScope = detectExplicitSchoolScope(clean, schoolScope);
  const expandedSet = new Set<string>();
  const labels: string[] = [];

  for (const rule of LOCAL_REWRITE_RULES) {
    if (rule.pattern.test(clean)) {
      for (const t of rule.terms) expandedSet.add(t);
      if (rule.label && !labels.includes(rule.label)) labels.push(rule.label);
    }
  }

  // Klassenstufen-Erkennung (z. B. "7. klasse" -> "Klassenstufe 7")
  const gradeMatch = clean.match(/\b(\d{1,2})\s*\.?\s*(?:klasse|kl\.?|klassenstufe)\b/i);
  if (gradeMatch) {
    expandedSet.add(`Klassenstufe ${gradeMatch[1]}`);
  }

  const scopeLabel =
    effectiveScope === 'regelschule'
      ? 'Regelschule (HBS)'
      : effectiveScope === 'tgs'
      ? 'Regelschule & TGS'
      : 'Alle Schularten';

  if (effectiveScope === 'regelschule') {
    expandedSet.add('Regelschule');
  }

  const expandedTerms = Array.from(expandedSet);
  const embeddingQuery =
    expandedTerms.length > 0
      ? `${clean}\nKontext (${scopeLabel}): ${expandedTerms.join(', ')}`
      : `${clean} (${scopeLabel})`;

  const contextSummary =
    labels.length > 0
      ? `${scopeLabel} · ${labels.slice(0, 2).join(' / ')}`
      : `${scopeLabel} · Direkte Rechtsrecherche`;

  return {
    originalQuery: clean,
    embeddingQuery,
    expandedTerms,
    contextSummary,
    effectiveSchoolScope: effectiveScope,
    usedAiRewrite: false,
    clarifyingQuestions: [],
  };
}

export async function contextualizeQuery(
  rawQuery: string,
  schoolScope: SchoolTypeScope = 'regelschule',
  userApiKey?: string
): Promise<ContextualizedQuery> {
  const local = contextualizeQueryLocally(rawQuery, schoolScope);
  const cacheKey = `${rawQuery.trim().toLowerCase()}::${schoolScope}::${userApiKey || ''}`;
  const cached = rewriteCache.get(cacheKey);
  if (cached) return cached;

  const scopeHint =
    local.effectiveSchoolScope === 'regelschule'
      ? 'Staatliche Regelschule in Thüringen (Klassenstufen 5–10, Anspruchsebenen I/II ab Kl. 7)'
      : local.effectiveSchoolScope === 'tgs'
      ? 'Thüringer Regelschule / Thüringer Gemeinschaftsschule (TGS)'
      : 'Alle Thüringer Schularten (ThürSchulG / ThürSchulO)';

  const systemPrompt = `Du bist ein juristischer Such-Kontextualisierer für den Schulalmanach der Heimbürgeschule Kahla (Thüringen).
Wandle eine umgangssprachliche Lehrerfrage in präzise Suchbegriffe des Thüringer Schulrechts um.
Kontext-Schulart: ${scopeHint}.

WICHTIGE ÜBERSETZUNGEN:
- Schulnoten in Umgangssprache: "5 / 5en / Fünfen" -> "mangelhaft"; "6 / 6en / Sechsen" -> "ungenügend"; "4" -> "ausreichend".
- "versetzen / sitzenbleiben / durchfallen" -> "Versetzung, Aufrücken, Ausgleichsregelung, Wiederholung, § 51 ThürSchulO, § 49 ThürSchulG".
- Bei Regelschule: Bevorzuge Regelschul-Paragraphen (§ 51 ThürSchulO Versetzung Regelschule, nicht § 50 Grundschule oder § 81 gymnasiale Oberstufe).
- Wenn wichtige Details fehlen (z. B. Klassenstufe, Ausgleichsfächer, Vorwiederholung, Kursniveau I/II), formuliere maximal 2 kurze klickbare Rückfragen in "clarifyingQuestions".

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "rewrittenQuery": "kompakte fachsprachliche Suchanfrage (max. 25 Wörter)",
  "legalTerms": ["Begriff1", "Begriff2", "§ ..."],
  "contextSummary": "Kurzer Titel, z. B. Regelschule · Versetzung Kl. 7 mit zwei mangelhaften Noten",
  "clarifyingQuestions": [
    { "question": "Kurze Rückfrage?", "refinedQuery": "Ausformulierte Rückfrage inkl. ursprünglicher Frage" }
  ]
}`;

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5500),
      body: JSON.stringify({
        systemPrompt,
        userPrompt: `Lehrerfrage: "${rawQuery.trim()}"`,
        apiKey: userApiKey || 'serverless-proxy',
        model: 'gemini-flash-lite-latest',
        temperature: 0.0,
        jsonMode: true,
        maxOutputTokens: 1200,
      }),
    });

    if (!res.ok) {
      return local;
    }

    const data = await res.json();
    const rawText = (data.text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(rawText);

    const aiTerms: string[] = Array.isArray(parsed.legalTerms)
      ? parsed.legalTerms.map((t: unknown) => String(t).trim()).filter(Boolean)
      : [];
    const mergedTerms = Array.from(new Set([...local.expandedTerms, ...aiTerms]));

    const rewritten = typeof parsed.rewrittenQuery === 'string' && parsed.rewrittenQuery.trim().length > 5
      ? parsed.rewrittenQuery.trim()
      : local.embeddingQuery;

    const clarifying: ClarifyingQuestion[] = Array.isArray(parsed.clarifyingQuestions)
      ? parsed.clarifyingQuestions
          .filter((q: any) => q && typeof q.question === 'string' && typeof q.refinedQuery === 'string')
          .slice(0, 3)
      : [];

    const result: ContextualizedQuery = {
      originalQuery: rawQuery.trim(),
      embeddingQuery: `${rewritten}\nSchlüsselbegriffe: ${mergedTerms.join(', ')}`,
      expandedTerms: mergedTerms,
      contextSummary:
        typeof parsed.contextSummary === 'string' && parsed.contextSummary.trim()
          ? parsed.contextSummary.trim()
          : local.contextSummary,
      effectiveSchoolScope: local.effectiveSchoolScope,
      usedAiRewrite: true,
      clarifyingQuestions: clarifying,
    };

    rewriteCache.set(cacheKey, result);
    return result;
  } catch {
    return local;
  }
}
