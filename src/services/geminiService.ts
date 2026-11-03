import { LegalChunk, AiAnswer, ActionStep, VerifiedCitation } from '../types/almanach';

interface GenerateAnswerParams {
  query: string;
  relevantChunks: LegalChunk[];
  userApiKey?: string;
  customModel?: string;
}

export async function generateLegalAnswer(params: GenerateAnswerParams): Promise<AiAnswer> {
  const { query, relevantChunks, userApiKey, customModel } = params;

  // Fallback, wenn keine Chunks gefunden wurden
  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      query,
      quickConclusion: 'Zu dieser konkreten Fragestellung konnten im Thüringer Rechtskorpus keine eindeutigen Bestimmungen gefunden werden.',
      actionSteps: [
        {
          stepNumber: 1,
          title: 'Schulleitung oder Schulamt konsultieren',
          description: 'Wenden Sie sich bei unklaren rechtlichen Sachverhalten an die Schulleitung oder das zuständige Staatliche Schulamt.',
          role: 'Lehrkraft',
        }
      ],
      exceptionsAndRules: ['Einzelfallprüfung durch die Schulleitung erforderlich.'],
      citations: [],
      category: 'schulrecht',
      confidenceScore: 0.1,
      usedModel: 'lokaler-index',
      timestamp: new Date().toISOString(),
      isOfflineFallback: true,
    };
  }

  // Chunks zu Kontexttext zusammenbauen
  const contextText = relevantChunks
    .map((c, i) => `[QUELLE ${i + 1}]
Dokument: ${c.docShortTitle}
Paragraph / Abschnitt: ${c.paragraph} - ${c.sectionTitle}
Gesetzestext: ${c.text}
Zusammenfassung & Kernpunkte: ${c.summary}
Offizielle Fundstelle: ${c.officialAnchorUrl}`)
    .join('\n\n---\n\n');

  const systemPrompt = `Du bist der offizielle KI-Rechtsassistent des Schulalmanachs der Staatlichen Regelschule Heimbürgeschule Kahla (Thüringen).
Deine Aufgabe ist es, Kolleginnen und Kollegen im Schulalltag verlässliche, rechtssichere und didaktisch praxistaugliche Auskünfte zu erteilen.

WICHTIGE JURISTISCHE GRUNDSÄTZE:
1. Erfinde NIEMALS Paragraphen, Gesetze oder Regelungen! Nutze ausschließlich das Thüringer Schulrecht (ThürSchulG, ThürSchulO, VVOrg, Wanderrichtlinie, RISU / UKT, ThürLehrAzVO, ThürAZStPLVO, ThürPersVG, ThürDSG) sowie die bereitgestellten Quellen.
2. Wenn eine Frage nicht eindeutig durch die Quellen beantwortet wird, sage das klar und verweise auf die Schulleitung.
3. Behalte immer die Thüringer Regelschul-Perspektive bei (z. B. 26 Pflichtstunden, Anspruchsebenen I und II ab Kl. 7).

Du musst die Antwort STRENG ALS VALIDES JSON im folgenden Schema zurückgeben:
{
  "quickConclusion": "1 bis 2 prägnante Sätze als direktes Schnell-Fazit für sofortige Handlungsfähigkeit im Schulalltag.",
  "actionSteps": [
    {
      "stepNumber": 1,
      "title": "Prägnanter Schritt-Titel",
      "description": "Genaue Beschreibung, was die Lehrkraft oder Schulleitung konkret tun muss.",
      "role": "Lehrkraft" // oder "Klassenleitung", "Schulleitung", "Fachlehrer", "Mentor"
    }
  ],
  "exceptionsAndRules": [
    "Wichtige Ausnahmen, Fristen oder Formvorschriften (z. B. 3-Tage-Frist, Schriftform, Anhörung)."
  ],
  "citations": [
    {
      "paragraph": "z. B. § 51 Abs. 2 ThürSchulG",
      "docTitle": "z. B. Thüringer Schulgesetz",
      "quote": "Wörtliches oder sinngemäßes Zitat der entscheidenden Textstelle aus den Quellen",
      "context": "Kurze Einordnung, warum diese Stelle relevant ist",
      "officialUrl": "URL aus den Quellen"
    }
  ]
}`;

  const userPrompt = `Fragestellung einer Lehrkraft der Heimbürgeschule:
"${query}"

Hier sind die offiziellen Auszüge aus den Thüringer Schulrechts- und Sicherheitsdokumenten:
${contextText}

Bitte erstelle die didaktisch-juristische Auswertung streng im geforderten JSON-Format.`;

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        apiKey: userApiKey || 'serverless-proxy',
        model: customModel,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API-Fehler HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.text || '';

    // JSON parsen (auch wenn Markdown-Codeblocks ```json vorhanden sind)
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    // Citations mit Chunk-IDs verknüpfen
    const enhancedCitations: VerifiedCitation[] = (parsed.citations || []).map((cit: any, idx: number) => {
      const matchedChunk = relevantChunks.find(
        (c) => c.paragraph.toLowerCase().includes(cit.paragraph?.toLowerCase() || '') ||
               cit.paragraph?.toLowerCase().includes(c.paragraph.toLowerCase())
      ) || relevantChunks[idx % relevantChunks.length];

      return {
        id: `cit-${Date.now()}-${idx}`,
        paragraph: cit.paragraph || matchedChunk.paragraph,
        docTitle: cit.docTitle || matchedChunk.docShortTitle,
        quote: cit.quote || matchedChunk.summary,
        context: cit.context || matchedChunk.sectionTitle,
        officialUrl: cit.officialUrl || matchedChunk.officialAnchorUrl,
        relevanceScore: 0.95 - (idx * 0.05),
        chunkId: matchedChunk.id,
      };
    });

    return {
      query,
      quickConclusion: parsed.quickConclusion || 'Rechtliche Auswertung abgeschlossen.',
      actionSteps: parsed.actionSteps || [],
      exceptionsAndRules: parsed.exceptionsAndRules || [],
      citations: enhancedCitations,
      category: relevantChunks[0].category,
      confidenceScore: 0.95,
      usedModel: data.model || 'Gemini 3 Flash',
      timestamp: new Date().toISOString(),
      isOfflineFallback: false,
    };
  } catch (err: any) {
    // Robuster Offline- / Client-Fallback
    console.warn('KI-Proxy nicht erreichbar oder Antwort ungültig, erstelle Offline-Auswertung:', err.message);

    const fallbackCitations: VerifiedCitation[] = relevantChunks.map((c, idx) => ({
      id: `cit-offline-${Date.now()}-${idx}`,
      paragraph: c.paragraph,
      docTitle: c.docShortTitle,
      quote: c.summary,
      context: c.sectionTitle,
      officialUrl: c.officialAnchorUrl,
      relevanceScore: 0.9 - idx * 0.1,
      chunkId: c.id,
    }));

    const primaryChunk = relevantChunks[0];

    const fallbackSteps: ActionStep[] = primaryChunk.keyTakeaways.map((takeaway, idx) => ({
      stepNumber: idx + 1,
      title: `Rechtliche Vorgabe ${idx + 1}`,
      description: takeaway,
      role: 'Lehrkraft',
    }));

    return {
      query,
      quickConclusion: `Gemäß ${primaryChunk.paragraph}: ${primaryChunk.summary}`,
      actionSteps: fallbackSteps,
      exceptionsAndRules: [
        'Auswertung basiert auf dem vorindexierten Thüringer Rechtskorpus der Heimbürgeschule.',
        'Für Details bitte direkt den verlinkten Paragraphen öffnen.'
      ],
      citations: fallbackCitations,
      category: primaryChunk.category,
      confidenceScore: 0.85,
      usedModel: 'Offline-Index (Heimbürgeschule)',
      timestamp: new Date().toISOString(),
      isOfflineFallback: true,
    };
  }
}
