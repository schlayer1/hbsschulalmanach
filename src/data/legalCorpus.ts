import { LegalDocument, LegalChunk } from '../types/almanach';

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-thuerschulg',
    title: 'Thüringer Schulgesetz (ThürSchulG)',
    shortTitle: 'ThürSchulG',
    legalBasis: 'Gesetzliche Grundlage des Thüringer Schulwesens',
    category: 'schulrecht',
    currentVersion: 'Fassung vom 30. April 2003, zuletzt geändert durch Gesetz vom 15. Juli 2024',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP1',
    description: 'Zentrales Landesgesetz für alle staatlichen Schulen in Thüringen: Schulpflicht, Erziehungs- und Ordnungsmaßnahmen (§ 51), Mitwirkungsrechte von Schülern, Eltern und Lehrkräften sowie Schulkonferenz.',
    chunksCount: 8,
    tags: ['Schulgesetz', 'Erziehungs- und Ordnungsmaßnahmen', '§ 51', 'Schulpflicht', 'Regelschule § 6', 'Schulkonferenz'],
  },
  {
    id: 'doc-thuerschulo',
    title: 'Thüringer Schulordnung (ThürSchulO)',
    shortTitle: 'ThürSchulO',
    legalBasis: 'Verordnung für Grundschule, Regelschule, Gemeinschaftsschule, Gymnasium, Gesamtschule und Förderschule',
    category: 'schulrecht',
    currentVersion: 'Geltende konsolidierte Fassung (Stand 2024/2026)',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP1',
    description: 'Detaillierte Durchführungsbestimmungen: Leistungsbewertung, Klassenarbeiten (§ 56), Hausaufgaben (§ 57), 6-stufige Notenskala, Versetzung (§§ 61–64), Regelschulabschlüsse (§§ 90–95) und Fehlzeiten/Entschuldigungen.',
    chunksCount: 9,
    tags: ['Schulordnung', 'Klassenarbeiten § 56', 'Hausaufgaben § 57', 'Leistungsbewertung § 58', 'Versetzung', 'Hauptschulabschluss', 'Realschulabschluss'],
  },
  {
    id: 'doc-vvorg',
    title: 'Verwaltungsvorschrift zur Organisation des Schuljahres (VVOrg)',
    shortTitle: 'VVOrg Thüringen',
    legalBasis: 'Verwaltungsvorschrift des Ministeriums für Bildung, Wissenschaft und Kultur Thüringen',
    category: 'organisation',
    currentVersion: 'VVOrg für das Schuljahr 2025/2026 (inkl. Fortschreibung 2026/2027)',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://bildung.thueringen.de/schule/organisation/vvorg',
    description: 'Verbindliche Vorgaben für das Schuljahr: ZPVI-Stundenberechnung, Stundentafeln, Vorbereitungswoche, Prüfungs- und Zeugnistermine, Festlegung von Klassenleitungen und Entlastungskontingenten.',
    chunksCount: 5,
    tags: ['VVOrg', 'Stundentafel', 'ZPVI', 'Vorbereitungswoche', 'Zeugnistermine', 'Prüfungszeiträume'],
  },
  {
    id: 'doc-wanderrichtlinie',
    title: 'Richtlinie für Schulfahrten (Wanderrichtlinie Thüringen)',
    shortTitle: 'Wanderrichtlinie Thüringen',
    legalBasis: 'Verwaltungsvorschrift für Wandertage und Schulfahrten an staatlichen Schulen',
    category: 'fahrten',
    currentVersion: 'Geltende Fassung „Lernen am anderen Ort“ (Amtsblatt TMBJS)',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://bildung.thueringen.de/schule/schulleben/schulfahrten',
    description: 'Genehmigungsverfahren durch Schulleitung vor Vertragsschluss, Dienstreiseantrag, striktes Verbot von Freiplätzen für Begleitpersonen (Antikorruption), Kostenobergrenzen der Schulkonferenz und Bade-/Schwimmaufsicht.',
    chunksCount: 6,
    tags: ['Klassenfahrt', 'Wandertag', 'Schulfahrt', 'Genehmigung', 'Dienstreise', 'Freiplatzverbot', 'Badeerlaubnis'],
  },
  {
    id: 'doc-risu',
    title: 'Richtlinie zur Sicherheit im Unterricht (RISU / UKT)',
    shortTitle: 'RISU / UKT',
    legalBasis: 'KMK-Empfehlung in Verbindung mit DGUV Regel 113-018 und Vorschriften der Unfallkasse Thüringen (UKT)',
    category: 'sicherheit',
    currentVersion: 'Fassung 2023/2024 mit fortlaufenden UKT-Aktualisierungen',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://www.ukt.de/praevention/schulen-und-kindertageseinrichtungen/arbeitsschutz-in-der-schule',
    description: 'Verbindliche Sicherheitsstandards für Fachräume: Chemie (Gefahrstoffkataster DEGINTU, Schutzbrillenpflicht, Substitutionsgebot, Abzugspflicht, Giftschrank), Physik (Laserklassen 1–2), Werken/Technik und 3-Tage-Unfallanzeige an die UKT.',
    chunksCount: 7,
    tags: ['RISU', 'UKT', 'Unfallkasse', 'Gefahrstoffe', 'Schutzbrille', 'Abzug', 'Chemieraum', 'Laser', 'DEGINTU'],
  },
  {
    id: 'doc-laa-thueringen',
    title: 'Ausbildung & Zweite Staatsprüfung Lehramtsanwärter (ThürAZStPLVO & ThürLbG)',
    shortTitle: 'ThürAZStPLVO (LAA)',
    legalBasis: 'Thüringer Verordnung über die Ausbildung und Zweite Staatsprüfung für die Lehrämter & Thüringer Lehrerbildungsgesetz',
    category: 'ausbildung',
    currentVersion: 'Geltende Verordnungsfassung',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbStPrVTHpP1',
    description: 'Regelungen für den 24-monatigen Vorbereitungsdienst an Regelschulen: Hospitationen, angeleiteter Unterricht, eigenverantwortlicher Unterricht (im Schnitt 10–14 Wochenstunden), Betreuung durch Ausbildungslehrer/Mentoren und Lehrproben.',
    chunksCount: 5,
    tags: ['Lehramtsanwärter', 'LAA', 'Referendariat', 'Vorbereitungsdienst', 'Mentoring', 'Eigenverantwortlicher Unterricht'],
  },
  {
    id: 'doc-seiteneinsteiger',
    title: 'Pädagogische Einführung & Nachqualifizierung Seiteneinsteiger',
    shortTitle: 'Seiteneinsteiger-Richtlinie',
    legalBasis: 'Richtlinien des TMBJS und ThILLM zur Qualifizierung von Seiteneinsteigern an Regelschulen',
    category: 'ausbildung',
    currentVersion: 'Geltendes Thüringer Seiteneinstiegs- und Onboarding-Konzept',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://lehrerinthueringen.de/seiteneinstieg',
    description: 'Der 3-monatige (12-wöchige) Schutzraum-Vorkurs des ThILLM, kontinuierliche Begleitung durch Mentoren an der Schule, 12–24 Monate Nachqualifizierung und Anrechnungs-/Entlastungsstunden.',
    chunksCount: 4,
    tags: ['Seiteneinsteiger', 'ThILLM', 'Vorkurs', 'Nachqualifizierung', 'Mentor', 'Schutzraum'],
  },
  {
    id: 'doc-duales-studium',
    title: 'Duales Lehramtsstudium Thüringen (Regelschule)',
    shortTitle: 'Duales Studium TMBJS',
    legalBasis: 'Kooperationsvereinbarung TMBJS & Universität Erfurt für das Regelschullehramt',
    category: 'ausbildung',
    currentVersion: 'Rahmenplan Duales Studium Regelschule',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://lehrerinthueringen.de/duales-studium',
    description: 'Das duale Modell für Regelschulen: Ab 3. Semester 3 Tage Universität / 2 feste Praxistage an der Schule (Montag und Freitag), Vergütung (1.550 € Bachelor / 1.800 € Master), Mentorierung an der Schule und verkürztes Referendariat (12 Monate).',
    chunksCount: 4,
    tags: ['Duales Studium', 'Regelschule', 'Uni Erfurt', 'Praxistage', 'Montag und Freitag', 'Vergütung'],
  },
  {
    id: 'doc-thuerlehrazvo',
    title: 'Thüringer Lehrerarbeitszeitverordnung (ThürLehrAzVO)',
    shortTitle: 'ThürLehrAzVO',
    legalBasis: 'Thüringer Verordnung über die Arbeitszeit der beamteten und angestellten Lehrkräfte',
    category: 'dienstrecht',
    currentVersion: 'Geltende Fassung (mit Änderungen)',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrArbZVO2006THpP1',
    description: '§ 4 Abs. 1 Nr. 2: 26 Pflichtstunden Regelunterricht pro Woche für Lehrkräfte an Regelschulen (Kl. 5–10), 40 Stunden Jahreswochenarbeitszeit, Entlastungsstunden für Schulleitung/Klassenleitung und Altersermäßigung.',
    chunksCount: 5,
    tags: ['Arbeitszeit', 'Pflichtstunden', '26 Stunden', 'Regelschule', 'ThürLehrAzVO', 'Altersermäßigung', 'Entlastungsstunden'],
  },
  {
    id: 'doc-thuerpersvg',
    title: 'Thüringer Personalvertretungsgesetz & Mitbestimmung (ThürPersVG)',
    shortTitle: 'ThürPersVG / Mitbestimmung',
    legalBasis: 'Thüringer Personalvertretungsgesetz in Verbindung mit §§ 39, 40 ThürSchulG',
    category: 'dienstrecht',
    currentVersion: 'Geltende Fassung des ThürPersVG',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-PersVGTH2019pP1',
    description: 'Mitbestimmungsrechte des Örtlichen Personalrats (ÖPR) bei Aufsichtsplänen, Stundenplan- und Vertretungsgrundsätzen sowie Aufgaben von Lehrerkonferenz (§ 39 ThürSchulG) und Schulkonferenz (§ 40 ThürSchulG).',
    chunksCount: 4,
    tags: ['Personalrat', 'ÖPR', 'Mitbestimmung', 'Lehrerkonferenz', 'Schulkonferenz', 'Aufsichtsplan'],
  },
  {
    id: 'doc-datenschutz',
    title: 'Datenschutz an Thüringer Schulen (ThürDSG & DSGVO)',
    shortTitle: 'Datenschutz Thüringen',
    legalBasis: 'Thüringer Datenschutzgesetz (ThürDSG), DSGVO und Richtlinien des TMBJS für digitale Medien',
    category: 'datenschutz',
    currentVersion: 'Geltende Fassung mit Datenschutz-Handreichung für Schulen',
    lastCheckedDate: '2026-11-01',
    officialUrl: 'https://bildung.thueringen.de/schule/digitalisierung/datenschutz',
    description: 'Rechtssichere Speicherung von Noten und Schülerdaten auf Dienst-iPads, keine Weitergabe in private Messenger/Clouds, Regelungen für Schülerfotos bei Schulfesten und Grundsatz der Datensparsamkeit.',
    chunksCount: 4,
    tags: ['Datenschutz', 'DSGVO', 'ThürDSG', 'iPad', 'Notenlisten', 'Fotos', 'Schulcloud'],
  },
  {
    id: 'doc-hbs-intern',
    title: 'Hausordnung & Schulspezifika Staatliche Regelschule Heimbürgeschule Kahla',
    shortTitle: 'HBS Hausordnung & Konzepte',
    legalBasis: 'Schulinterne Ordnung beschlossen von der Schulkonferenz der Heimbürgeschule Kahla',
    category: 'hbs_intern',
    currentVersion: 'Aktuelle Schulordnung Heimbürgeschule Kahla (Schuljahr 2025/2026)',
    lastCheckedDate: '2026-11-01',
    officialUrl: '#hbs-intern',
    description: 'Schulinterne Hausordnung: Smartphone-Regelung (im Schulhaus während des Unterrichts ausgeschaltet in der Schultasche; Ausnahme: unterrichtliche Nutzung durch Lehrkraft angeordnet), Pausen- und Hofaufsichtsbereiche, Vertretungskonzept und Krisenleitfaden.',
    chunksCount: 5,
    tags: ['Heimbürgeschule', 'Hausordnung', 'Kahla', 'Smartphones', 'Pausenaufsicht', 'Krisenteam', 'Schulcharta'],
    isInternal: true,
  },
];

export const LEGAL_CHUNKS: LegalChunk[] = [
  // ==========================================
  // THÜRINGER SCHULGESETZ (ThürSchulG)
  // ==========================================
  {
    id: 'chunk-schulg-51-1',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§ 51 Abs. 1 ThürSchulG',
    sectionTitle: 'Pädagogische Maßnahmen (Erzieherische Einwirkungen)',
    text: `(1) Pädagogische Maßnahmen dienen der Erfüllung des Bildungs- und Erziehungsauftrags der Schule sowie dem Schutz von Personen und Sachen. Sie sind vorrangig vor Ordnungsmaßnahmen anzuwenden. Zu den pädagogischen Maßnahmen gehören insbesondere das klärende Gespräch mit dem Schüler, die Ermahnung, die mündliche oder schriftliche Missbilligung, die Beauftragung mit Aufgaben, die geeignet sind, das Fehlverhalten einsichtig zu machen, die Nachholung schuldhaft versäumten Unterrichts nach Benachrichtigung der Eltern sowie die zeitweise Wegnahme von Gegenständen, die den Unterricht oder die Ordnung der Schule stören.`,
    summary: 'Pädagogische Maßnahmen haben stets Vorrang vor Ordnungsmaßnahmen. Erlaubt sind u. a. klärendes Gespräch, Ermahnung, Nacharbeit nach Elternbenachrichtigung und zeitweise Wegnahme störender Gegenstände.',
    keyTakeaways: [
      'Strikter Vorrang vor Ordnungsmaßnahmen (Grundsatz der Verhältnismäßigkeit)',
      'Klärendes Gespräch und Ermahnung als erste Stufe',
      'Nachholen versäumten Unterrichts erfordert vorherige Information der Eltern',
      'Störende Gegenstände (z. B. Smartphone) dürfen zeitweise einbehalten werden'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP51',
    tags: ['§ 51', 'Pädagogische Maßnahmen', 'Erziehungsmittel', 'Smartphone-Einzug', 'Nacharbeit'],
  },
  {
    id: 'chunk-schulg-51-2',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§ 51 Abs. 2 & 3 ThürSchulG',
    sectionTitle: 'Katalog der Ordnungsmaßnahmen & Zuständigkeiten',
    text: `(2) Ordnungsmaßnahmen dürfen nur angewendet werden, wenn pädagogische Maßnahmen nach Absatz 1 nicht ausreichen oder die Pflichtverletzung schwerwiegend oder wiederholt ist. Sie müssen in einem angemessenen Verhältnis zum Fehlverhalten stehen.
(3) Ordnungsmaßnahmen sind:
1. der schriftliche Verweis durch den Klassenlehrer,
2. der strenge Verweis durch den Schulleiter,
3. der Ausschluss von besonderen Klassen- oder Schulveranstaltungen durch den Schulleiter auf Beschluss der Klassenkonferenz,
4. die Überweisung in eine Parallelklasse derselben Schule durch den Schulleiter auf Beschluss der Klassenkonferenz,
5. der vorübergehende Ausschluss vom Unterricht für die Dauer von bis zu sechs Unterrichtstagen durch den Schulleiter auf Beschluss der Klassenkonferenz,
6. die Entlassung aus der Schule oder die Androhung der Entlassung durch die Schulaufsichtsbehörde auf Antrag der Schulkonferenz.`,
    summary: 'Stufenkatalog der Ordnungsmaßnahmen: 1. Schriftlicher Verweis (Klassenleitung), 2. Strenger Verweis (Schulleitung), 3. Veranstaltungsausschluss, 4. Parallelklasse, 5. Unterrichtsausschluss bis 6 Tage (Schulleitung nach Klassenkonferenz), 6. Schulausschluss (Schulamt).',
    keyTakeaways: [
      'Schriftlicher Verweis wird durch die Klassenleitung erteilt',
      'Strenger Verweis liegt in der Zuständigkeit der Schulleitung',
      'Unterrichtsausschluss (bis 6 Tage) und Veranstaltungsausschluss bedürfen Beschluss der Klassenkonferenz und Anordnung durch Schulleitung',
      'Verhältnismäßigkeit und vorheriges Versagen pädagogischer Maßnahmen zwingend erforderlich'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP51',
    tags: ['§ 51', 'Ordnungsmaßnahmen', 'Suspendierung', 'Schriftlicher Verweis', 'Strenger Verweis', 'Klassenkonferenz'],
  },
  {
    id: 'chunk-schulg-51-4',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§ 51 Abs. 4 & 5 ThürSchulG',
    sectionTitle: 'Verfahrensvorschriften: Anhörung, Schriftform & Rechtsbehelfsbelehrung',
    text: `(4) Vor der Entscheidung über eine Ordnungsmaßnahme ist dem Schüler und seinen Eltern Gelegenheit zur Anhörung zu geben. Dem Schüler ist auf sein Verlangen Gelegenheit zu geben, eine Lehrkraft oder eine Person seines Vertrauens hinzuzuziehen.
(5) Ordnungsmaßnahmen sind schriftlich zu begründen und mit einer Rechtsbehelfsbelehrung zu versehen. Gegen Ordnungsmaßnahmen nach Absatz 3 Nr. 1 bis 5 ist der Widerspruch zulässig. Der Widerspruch gegen Maßnahmen nach Absatz 3 Nr. 1 und 2 hat keine aufschiebende Wirkung.`,
    summary: 'Rechtssicheres Verfahren bei Ordnungsmaßnahmen: Zwingende vorherige Anhörung von Schüler und Eltern, Vertrauensperson zulässig, zwingende Schriftform mit Begründung und Rechtsbehelfsbelehrung (Widerspruch).',
    keyTakeaways: [
      'Vorherige Anhörung von Schüler und Erziehungsberechtigten ist unabdingbare Wirksamkeitsvoraussetzung',
      'Schüler kann Vertrauensperson oder Lehrkraft hinzuziehen',
      'Schriftform mit tatsächlicher und rechtlicher Begründung vorgeschrieben',
      'Rechtsbehelfsbelehrung (Widerspruchsrecht) zwingend beizufügen'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP51',
    tags: ['§ 51', 'Anhörung', 'Widerspruch', 'Rechtsbehelfsbelehrung', 'Schriftform', 'Verwaltungsakt'],
  },
  {
    id: 'chunk-schulg-6',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§ 6 ThürSchulG',
    sectionTitle: 'Die Regelschule in Thüringen (Bildungsgänge & Anspruchsebenen)',
    text: `(1) Die Regelschule vermittelt eine grundlegende und erweiterte allgemeine Bildung und bereitet die Schüler vor allem auf eine berufliche Ausbildung, aber auch auf weiterführende Bildungsgänge vor. Sie umfasst die Klassenstufen 5 bis 9 bzw. 10.
(2) In den Klassenstufen 5 und 6 wird der Unterricht schulartunabhängig im gemeinsamen Klassenverband erteilt (Orientierungsstufe). Ab der Klassenstufe 7 wird der Unterricht nach Bildungsgängen oder in Kursen auf zwei Anspruchsebenen (grundlegende Anspruchsebene I für den Hauptschulabschluss und erhöhte Anspruchsebene II für den Realschulabschluss) erteilt.`,
    summary: 'Die Regelschule umfasst Klassenstufen 5 bis 10. In Klassen 5 und 6 gemeinsamer Unterricht (Orientierungsstufe), ab Klasse 7 Differenzierung nach Anspruchsebenen I (Hauptschule) und II (Realschule).',
    keyTakeaways: [
      'Kl. 5 und 6 als gemeinsame Orientierungsstufe ohne Trennung',
      'Ab Kl. 7 Differenzierung nach Anspruchsebene I (grundlegend) und II (erhöht)',
      'Abschlussorientierung: Hauptschulabschluss (Kl. 9) bzw. Realschulabschluss (Kl. 10)'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP6',
    tags: ['§ 6', 'Regelschule', 'Orientierungsstufe', 'Anspruchsebene I', 'Anspruchsebene II'],
  },
  {
    id: 'chunk-schulg-17-24',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§§ 17, 19, 23, 24 ThürSchulG',
    sectionTitle: 'Schulpflicht, Fehlzeiten & Schulzwang',
    text: `(1) Die Schulpflicht gliedert sich in die Vollzeitschulpflicht und die Berufsschulpflicht. Die Vollzeitschulpflicht dauert in der Regel neun Schuljahre.
(2) Schüler sind verpflichtet, am Unterricht und an den sonstigen verbindlichen Schulveranstaltungen regelmäßig und ordnungsgemäß teilzunehmen und die Schulordnung einzuhalten.
(3) Die Eltern sind verpflichtet, für die regelmäßige Teilnahme des Schülers am Unterricht und an den verbindlichen Veranstaltungen der Schule sowie für die Erfüllung der Schulpflicht zu sorgen.
(4) Bei vorsätzlicher oder beharrlicher Verletzung der Schulpflicht kann die Schulleitung nach erfolglosem Anhörungs- und Mahnverfahren ein Bußgeldverfahren nach § 62 ThürSchulG einleiten oder bei der zuständigen Behörde die zwangsweise Zuführung (Schulzwang) veranlassen.`,
    summary: 'Schulpflicht dauert 9 Schuljahre Vollzeit. Schüler und Eltern sind zur Teilnahme und Einhaltung verpflichtet. Bei beharrlichem Schwänzen: Mahnverfahren, Bußgeldantrag (§ 62) oder Schulzwang.',
    keyTakeaways: [
      'Vollzeitschulpflicht von 9 Schuljahren',
      'Verbindliche Teilnahme an Unterricht und Schulveranstaltungen (auch Wandertage)',
      'Eltern tragen rechtliche Verantwortung für die Schulpflicht',
      'Bei Schulabsentismus: Dokumentation, Elterngespräch, Bußgeldantrag nach § 62'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP17',
    tags: ['Schulpflicht', 'Schulabsentismus', 'Schwänzen', 'Bußgeld', 'Schulzwang'],
  },
  {
    id: 'chunk-schulg-30-31',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§§ 30, 31 ThürSchulG',
    sectionTitle: 'Rechte und Pflichten der Schüler & Rechte der Eltern',
    text: `§ 30: Die Schüler haben die Pflicht, am Unterricht und den verbindlichen Schulveranstaltungen teilzunehmen, die erforderlichen Arbeiten anzufertigen, den Anordnungen der Schulleitung und der Lehrkräfte Folge zu leisten und das Ansehen der Schule nicht zu schädigen.
§ 31: Die Eltern haben das Recht, über die Lern- und Leistungsentwicklung ihres Kindes sowie über das Verhalten in der Schule regelmäßig und rechtzeitig informiert und beraten zu werden. Die Schule bietet hierzu regelmäßige Elternsprechtage und Beratungsgespräche an.`,
    summary: 'Schüler müssen Anordnungen befolgen, Hausaufgaben machen und Schulveranstaltungen besuchen. Eltern haben einklagbares Recht auf rechtzeitige Information bei Leistungsabfall oder Gefährdung.',
    keyTakeaways: [
      'Pflicht der Schüler zur Anfertigung von Aufgaben und Befolgung von Weisungen',
      'Recht der Eltern auf Beratung und Leistungsfortschritts-Information',
      'Frühwarnpflicht der Schule bei drohender Nichtversetzung'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP30',
    tags: ['Schülerpflichten', 'Elternrechte', 'Beratung', 'Elternsprechtag'],
  },
  {
    id: 'chunk-schulg-39-40',
    docId: 'doc-thuerschulg',
    docShortTitle: 'ThürSchulG',
    category: 'schulrecht',
    paragraph: '§§ 39, 40 ThürSchulG',
    sectionTitle: 'Lehrerkonferenz & Schulkonferenz',
    text: `§ 39: Die Lehrerkonferenz berät und beschließt über Angelegenheiten der pädagogischen Arbeit, der Unterrichtsgestaltung und der schulinternen Zusammenarbeit, soweit nicht die Schulkonferenz zuständig ist.
§ 40: Die Schulkonferenz ist das oberste Beratungs- und Beschlussgremium der Schule für grundsätzliche Angelegenheiten. Sie setzt sich an Regelschulen paritätisch aus Vertretern der Lehrkräfte, der Eltern und der Schüler zusammen. Der Schulleiter führt den Vorsitz. Die Schulkonferenz beschließt u. a. über die Hausordnung, das Schulprogramm, Grundsätze für Wandertage und Schulfahrten sowie über Anträge auf Schulversuche.`,
    summary: 'Lehrerkonferenz regelt pädagogische Unterrichtsfragen. Schulkonferenz (paritätisch Lehrkräfte, Eltern, Schüler) beschließt Hausordnung, Schulprogramm und Schulfahrtengrundsätze.',
    keyTakeaways: [
      'Lehrerkonferenz für methodisch-pädagogische Beschlüsse',
      'Schulkonferenz als paritätisches Leitgremium (Lehrer, Eltern, Schüler)',
      'Hausordnung und Fahrtenkonzepte bedürfen Schulkonferenzbeschluss'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP40',
    tags: ['Lehrerkonferenz', 'Schulkonferenz', 'Mitbestimmung', 'Hausordnung', 'Schulprogramm'],
  },

  // ==========================================
  // THÜRINGER SCHULORDNUNG (ThürSchulO)
  // ==========================================
  {
    id: 'chunk-schulo-56',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§ 56 ThürSchulO',
    sectionTitle: 'Klassenarbeiten & Leistungsnachweise',
    text: `(1) Klassenarbeiten dienen der Feststellung des Lernerfolgs in einem zusammenhängenden Unterrichtsabschnitt. Sie müssen sich organisch aus dem fortlaufenden Unterricht ergeben.
(2) Klassenarbeiten müssen den Schülern mindestens eine Woche vorher angekündigt werden. An einem Tag darf grundsätzlich nur eine Klassenarbeit geschrieben werden. An zwei aufeinanderfolgenden Unterrichtstagen darf nicht mehr als eine Klassenarbeit geschrieben werden.
(3) In einer Schulwoche dürfen nicht mehr als drei Klassenarbeiten geschrieben werden. Klassenarbeiten sind innerhalb von drei Schulwochen korrigiert und bewertet zurückzugeben und mit den Schülern zu besprechen.`,
    summary: 'Klassenarbeiten: Mindestens 1 Woche Ankündigungsfrist, max. 1 Arbeit pro Tag, KEINE Klassenarbeit an zwei aufeinanderfolgenden Tagen, max. 3 Arbeiten pro Woche. Rückgabefrist: binnen 3 Schulwochen.',
    keyTakeaways: [
      'Ankündigungspflicht: Mindestens eine Woche im Voraus',
      'Tageslimit & Folgetagschutz: Nicht mehr als eine Arbeit an 2 aufeinanderfolgenden Tagen',
      'Wochenlimit: Maximal 3 Arbeiten in einer Schulwoche',
      'Rückgabefrist: Spätestens nach 3 Schulwochen besprochen zurück'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP56',
    tags: ['§ 56', 'Klassenarbeiten', 'Ankündigung', 'Tageslimit', 'Korrekturfrist', 'Leistungsnachweis'],
  },
  {
    id: 'chunk-schulo-57',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§ 57 ThürSchulO',
    sectionTitle: 'Hausaufgaben (Umfang & Zweck)',
    text: `(1) Hausaufgaben ergänzen die Unterrichtsarbeit und dienen der Festigung, Vertiefung und Vorbereitung des im Unterricht Gelernten. Sie müssen so beschaffen sein, dass die Schüler sie ohne fremde Hilfe in angemessener Zeit selbstständig bewältigen können.
(2) Der zeitliche Umfang der Hausaufgaben muss altersangemessen begrenzt sein. An Regelschulen soll die tägliche Arbeitszeit für Hausaufgaben in den Klassenstufen 5 und 6 in der Regel 60 Minuten, in den Klassenstufen 7 bis 10 in der Regel 90 Minuten nicht überschreiten.
(3) Von einem Freitag auf einen Montag sowie über Feiertage und Ferien dürfen keine schriftlichen Hausaufgaben gestellt werden, es sei denn, es handelt sich um langfristig angelegte Projektarbeiten.`,
    summary: 'Hausaufgaben: Zur Vertiefung, ohne fremde Hilfe lösbar. Zeitrahmen Regelschule: Kl. 5/6 max. 60 Min., Kl. 7-10 max. 90 Min. Keine schriftlichen Hausaufgaben über das Wochenende (Fr auf Mo) oder Ferien.',
    keyTakeaways: [
      'Selbstständige Lösbarkeit ohne Nachhilfe als Kriterium',
      'Zeitlimit: Kl. 5-6 max. 60 Minuten; Kl. 7-10 max. 90 Minuten täglich',
      'Wochenendschutz: Von Freitag auf Montag grundsätzlich keine schriftlichen Hausaufgaben',
      'Ferienschutz: Keine Hausaufgaben über Ferien'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP57',
    tags: ['§ 57', 'Hausaufgaben', 'Wochenende', 'Ferien', 'Zeitlimit', 'Regelschule'],
  },
  {
    id: 'chunk-schulo-58-60',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§§ 58, 59, 60 ThürSchulO',
    sectionTitle: 'Leistungsbewertung, Notenstufen & Täglicher Unterrichtsbeitrag',
    text: `§ 58 & 59: Die Leistungsbewertung stützt sich auf die Notenstufen 1 (sehr gut) bis 6 (ungenügend). Sie umfasst schriftliche, mündliche und praktische Leistungsnachweise. Noten dürfen nicht als Erziehungsmittel oder Disziplinarmaßnahme eingesetzt werden.
§ 60: Der tägliche Unterrichtsbeitrag umfasst die kontinuierliche mündliche Mitarbeit, Unterrichtsbeiträge, kurze schriftliche Feststellungen (Tests von bis zu 20 Minuten) sowie praktische Leistungen. Die Gesamtnote eines Halbjahres darf nicht allein aus Klassenarbeiten gebildet werden, sondern muss den täglichen Unterrichtsbeitrag angemessen gewichten (an Regelschulen i. d. R. mindestens 50 % bis 60 % mündlich/laufend).`,
    summary: 'Noten 1 bis 6. Noten sind keine Disziplinarmaßnahme! Halbjahrnote basiert nicht nur auf Klassenarbeiten: Der tägliche Unterrichtsbeitrag (mündlich, Tests max. 20 Min., Mitarbeit) wiegt mindestens gleich stark oder höher (50-60 %).',
    keyTakeaways: [
      'Verbot von Noten als Straf- oder Erziehungsmittel',
      'Täglicher Unterrichtsbeitrag umfasst mündliche Mitarbeit und Kurzkontrollen bis 20 Min.',
      'Ausgewogene Gewichtung: Klassenarbeiten dürfen nicht alleinige Basis sein',
      'Transparenzgebot: Noten müssen den Schülern auf Nachfrage begründet werden'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP58',
    tags: ['§ 58', '§ 59', '§ 60', 'Notengebung', 'Mündliche Note', 'Klassenarbeit', 'Leistungsbewertung'],
  },
  {
    id: 'chunk-schulo-fehlzeiten',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§§ 4, 5 ThürSchulO',
    sectionTitle: 'Krankmeldung, Entschuldigungspflicht & Beurlaubung',
    text: `(1) Ist ein Schüler durch Krankheit oder sonstige unvorhersehbare Gründe am Schulbesuch verhindert, so haben die Eltern die Schule am ersten Tag des Fehlens unverzüglich zu benachrichtigen. Die schriftliche Entschuldigung ist spätestens am dritten Fehltag vorzulegen.
(2) Bei gehäuften oder auffälligen Fehlzeiten sowie unmittelbar vor oder nach den Schulferien kann die Schulleitung die Vorlage eines ärztlichen Attestes oder in begründeten Fällen eines amtsärztlichen Attestes verlangen.
(3) Eine Beurlaubung vom Unterricht aus wichtigem Grund kann auf rechtzeitigen schriftlichen Antrag der Eltern gewährt werden:
- bis zu zwei Tagen durch den Klassenlehrer,
- darüber hinaus oder unmittelbar vor bzw. nach Ferienabschnitten ausschließlich durch den Schulleiter. Beurlaubungen vor und nach Ferien dürfen nur in absolut begründeten Ausnahmefällen erteilt werden.`,
    summary: 'Krankmeldung: Am ersten Tag sofort melden, schriftliche Entschuldigung bis zum 3. Tag. Attestpflicht bei Ferienrandzeiten oder gehäuften Fehlzeiten durch Schulleitung. Beurlaubung: Bis 2 Tage Klassenleitung, länger/vor Ferien nur Schulleitung.',
    keyTakeaways: [
      'Meldepflicht am 1. Fehltag, schriftliche Entschuldigung binnen 3 Tagen',
      'Schulleitung kann ärztliches/amtsärztliches Attest anordnen',
      'Klassenleitung darf bis zu 2 Unterrichtstage beurlauben',
      'Beurlaubungen direkt vor/nach den Ferien nur in strengen Ausnahmefällen durch die Schulleitung'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP4',
    tags: ['Krankmeldung', 'Fehlzeiten', 'Attestpflicht', 'Beurlaubung', 'Ferienrand', '3-Tage-Frist'],
  },
  {
    id: 'chunk-schulo-61-64',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§§ 61, 62, 63, 64 ThürSchulO',
    sectionTitle: 'Versetzung, Wiederholung & Nachprüfung an der Regelschule',
    text: `(1) Über die Versetzung entscheidet die Klassenkonferenz unter Vorsitz des Schulleiters oder Klassenlehrers am Ende des Schuljahres. Grundlage sind die Noten des Jahreszeugnisses in den Versetzungsfächern.
(2) Eine Versetzung erfolgt nicht, wenn in zwei Fächern die Note „mangelhaft“ (5) oder in einem Fach die Note „ungenügend“ (6) vorliegt, es sei denn, es liegt ein erfolgreicher Ausgleich nach den Bestimmungen der Schulordnung vor.
(3) Bei Nichtversetzung kann die Klassenstufe einmal freiwillig oder pflichtig wiederholt werden. In bestimmten Fällen kann die Klassenkonferenz eine Nachprüfung in den Sommerferien zulassen, wenn durch die Verbesserung von „mangelhaft“ auf „ausreichend“ in genau einem Fach die Versetzung erreicht werden kann.`,
    summary: 'Versetzung am Schuljahresende durch Klassenkonferenz. Nichtversetzung bei 2x Note 5 oder 1x Note 6 ohne Ausgleich. Nachprüfung zulässig, wenn die Verbesserung von einer 5 auf 4 zur Versetzung führt.',
    keyTakeaways: [
      'Klassenkonferenz entscheidet über Versetzung',
      'Versetzungsgefährdung erfordert rechtzeitige schriftliche Benachrichtigung (Blauer Brief)',
      'Nachprüfungsmöglichkeit in genau einem Fach zur Abwendung der Nichtversetzung',
      'Wiederholung einer Klassenstufe ist grundsätzlich möglich'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP61',
    tags: ['§ 61', 'Versetzung', 'Nichtversetzung', 'Nachprüfung', 'Wiederholung', 'Blauer Brief'],
  },
  {
    id: 'chunk-schulo-90-95',
    docId: 'doc-thuerschulo',
    docShortTitle: 'ThürSchulO',
    category: 'schulrecht',
    paragraph: '§§ 90–95 ThürSchulO',
    sectionTitle: 'Abschlüsse an der Regelschule (Hauptschul- & Realschulabschluss)',
    text: `(1) An der Regelschule können folgende Abschlüsse erworben werden:
1. der Hauptschulabschluss am Ende der Klassenstufe 9,
2. der Qualifizierende Hauptschulabschluss durch erfolgreiche Teilnahme an einer freiwilligen besonderen Leistungsfeststellung am Ende der Klassenstufe 9,
3. der Realschulabschluss am Ende der Klassenstufe 10 durch Bestehen der zentralen Realschulprüfung (schriftliche Prüfungen in Deutsch, Mathematik, erster Fremdsprache sowie mündliche Prüfungen).
(2) Zur Realschulprüfung in Klasse 10 wird zugelassen, wer in Klasse 9 den qualifizierten Übergang nach den Bestimmungen der Schulordnung erreicht hat.`,
    summary: 'Abschlüsse an der Thüringer Regelschule: 1. Hauptschulabschluss (Kl. 9), 2. Qualifizierender Hauptschulabschluss (Kl. 9 freiwillige Prüfung), 3. Realschulabschluss (Kl. 10 mit zentralen Prüfungen).',
    keyTakeaways: [
      'Hauptschulabschluss mit Versetzung in Klasse 10 bzw. Abschluss Kl. 9',
      'Quali durch freiwillige Prüfungen am Ende der 9. Klasse',
      'Realschulabschluss nach Klasse 10 mit zentralen landeseinheitlichen Prüfungen',
      'Prüfungsbestandteile: Deutsch, Mathe, Englisch schriftlich + mündliche Prüfung'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP90',
    tags: ['Regelschulabschluss', 'Hauptschulabschluss', 'Realschulabschluss', 'Quali', 'Prüfungen', 'Klasse 10'],
  },

  // ==========================================
  // VERWALTUNGSVORSCHRIFT SCHULORGANISATION (VVOrg)
  // ==========================================
  {
    id: 'chunk-vvorg-1',
    docId: 'doc-vvorg',
    docShortTitle: 'VVOrg',
    category: 'organisation',
    paragraph: 'VVOrg Abschnitt 1 & 2',
    sectionTitle: 'Schuljahresbeginn, Vorbereitungswoche & ZPVI-Planung',
    text: `(1) Die letzte Woche der Sommerferien ist für das gesamte Kollegium die verbindliche Vorbereitungswoche. In dieser Woche finden Dienstberatungen, Lehrerkonferenzen, Fachkonferenzen und organisatorische Vorbereitungen für das neue Schuljahr statt. Alle Lehrkräfte sind dienstverpflichtet anwesend.
(2) Die Unterrichtsversorgung und Lehrerzuweisung erfolgt über das Zentrale Planungs- und Verwaltungsinstrument (ZPVI) auf Basis der amtlichen Stundentafel und der Schülerzahlen.
(3) Schulleitungen sind verpflichtet, die Zuweisung von Klassenleitungen und Fachlehrern rechtzeitig vor Beginn der Sommerferien bzw. spätestens in der Vorbereitungswoche verbindlich festzulegen.`,
    summary: 'Vorbereitungswoche in der letzten Sommerferienwoche ist für alle Lehrkräfte Dienstpflicht. ZPVI steuert die Lehrerwochenstunden. Konferenzen und Raum-/Klassenverteilung werden dort final beschlossen.',
    keyTakeaways: [
      'Anwesenheits- und Dienstpflicht in der Vorbereitungswoche für alle Lehrkräfte',
      'Lehrerkonferenz beschließt Jahresarbeitsplan und Organisationsgrundsätze',
      'ZPVI als mathematische Grundlage für Unterrichtsstunden und Entlastungskontingente'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/organisation/vvorg',
    tags: ['VVOrg', 'Vorbereitungswoche', 'ZPVI', 'Dienstberatung', 'Schuljahresbeginn'],
  },
  {
    id: 'chunk-vvorg-2',
    docId: 'doc-vvorg',
    docShortTitle: 'VVOrg',
    category: 'organisation',
    paragraph: 'VVOrg Abschnitt 3',
    sectionTitle: 'Termine für Zeugnisse, Prüfungen & Förderpläne',
    text: `(1) Die Halbjahreszeugnisse werden am letzten Unterrichtstag des ersten Schulhalbjahres ausgegeben. Die Zeugniskonferenzen finden in der davorliegenden Woche statt.
(2) Jahreszeugnisse werden am letzten Schultag vor den Sommerferien ausgegeben. Für Abschlussklassen (Klassen 9 und 10) gelten gesonderte Zeugnistermine im Rahmen der feierlichen Zeugnisübergabe nach Abschluss der Prüfungen.
(3) Für Schüler mit festgestelltem sonderpädagogischen Förderbedarf oder gravierenden Lernschwierigkeiten sind individuelle Förderpläne spätestens sechs Wochen nach Schuljahresbeginn zu aktualisieren und mit den Erziehungsberechtigten abzustimmen.`,
    summary: 'Feste Fristen: Halbjahreszeugnisse am letzten Tag des Halbjahres, Jahreszeugnisse am letzten Schultag. Förderpläne müssen binnen 6 Wochen nach Schuljahresbeginn fortgeschrieben werden.',
    keyTakeaways: [
      'Zeugniskonferenzen in der Woche vor der Zeugnisausgabe',
      'Abschlussklassen haben vorgezogene Zeugnis- und Prüfungsfenster',
      'Förderplan-Aktualisierungspflicht: Spätestens 6 Wochen nach Schulbeginn'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/organisation/vvorg',
    tags: ['VVOrg', 'Zeugnisse', 'Halbjahreszeugnis', 'Förderpläne', 'Fristen'],
  },

  // ==========================================
  // WANDERTAGE & SCHULFAHRTEN (Wanderrichtlinie)
  // ==========================================
  {
    id: 'chunk-wander-genehmigung',
    docId: 'doc-wanderrichtlinie',
    docShortTitle: 'Wanderrichtlinie',
    category: 'fahrten',
    paragraph: 'Wanderrichtlinie Ziff. 2 & 3',
    sectionTitle: 'Genehmigungsvorbehalt durch Schulleitung & Dienstreiseantrag',
    text: `(1) Schulfahrten und Wandertage sind schulische Veranstaltungen („Lernen am anderen Ort“). Sie bedürfen der vorherigen schriftlichen Genehmigung durch die Schulleitung.
(2) Bevor die Schulleitung die Fahrt genehmigt hat, dürfen KEINE verbindlichen Verträge mit Transport- oder Unterkunftsunternehmen abgeschlossen werden, es sei denn, ein kostenfreies Rücktrittsrecht ist schriftlich vereinbart.
(3) Für alle teilnehmenden Lehrkräfte und Begleitpersonen ist rechtzeitig vor Antritt der Fahrt ein Dienstreiseantrag einzureichen und durch die Schulleitung zu genehmigen. Die Genehmigung darf nicht vom Verzicht auf Reisekostenvergütung abhängig gemacht werden.`,
    summary: 'Schulfahrten müssen vor Vertragsschluss schriftlich von der Schulleitung genehmigt werden. Keine Buchung ohne kostenfreie Stornooption vor Genehmigung! Dienstreiseantrag für Lehrkräfte zwingend.',
    keyTakeaways: [
      'Genehmigungsvorbehalt der Schulleitung vor jeder Buchung',
      'Verträge vor Genehmigung nur mit kostenlosem Rücktrittsrecht zulässig',
      'Dienstreisegenehmigung für begleitende Lehrkräfte erforderlich',
      'Verzicht auf Reisekostenerstattung darf nicht gefordert werden'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/schulleben/schulfahrten',
    tags: ['Wandertag', 'Klassenfahrt', 'Genehmigung', 'Dienstreise', 'Storno', 'Schulleitung'],
  },
  {
    id: 'chunk-wander-freiplatzverbot',
    docId: 'doc-wanderrichtlinie',
    docShortTitle: 'Wanderrichtlinie',
    category: 'fahrten',
    paragraph: 'Wanderrichtlinie Ziff. 4',
    sectionTitle: 'Striktes Freiplatzverbot & Antikorruptionsvorschriften',
    text: `(1) Im Freistaat Thüringen gilt für Lehrkräfte und Begleitpersonen ein striktes Annahmeverbot für Vergünstigungen (Antikorruptionsrichtlinie). Die Inanspruchnahme von Freiplätzen für Lehrkräfte (z. B. „jede 20. Person reist kostenlos“) ist ausdrücklich UNTERSAGT.
(2) Angebote von Reiseunternehmen müssen die Kosten für Schüler und für Begleitpersonen transparent und getrennt ausweisen. Werden Freiplätze gewährt, müssen diese rechnerisch auf alle teilnehmenden Schüler umgelegt werden, um den Schülerpreis zu senken.
(3) Die Kosten der Begleitpersonen sind über das Reisekostenbudget des Landes Thüringen bzw. der Schule abzurechnen.`,
    summary: 'Striktes Freiplatzverbot für Lehrkräfte! Freiplätze dürfen nicht persönlich genutzt werden; eventuelle Freiplätze müssen zur Verbilligung des Schülerpreises umgelegt werden. Kosten der Lehrer trägt das Land.',
    keyTakeaways: [
      'Lehrkräfte dürfen keinesfalls kostenlose Freiplätze annehmen (Dienstvergehen)',
      'Freiplätze müssen den Reisepreis aller Schüler senken',
      'Reiseunternehmen müssen Kosten für Schüler und Begleiter getrennt ausweisen'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/schulleben/schulfahrten',
    tags: ['Freiplatzverbot', 'Antikorruption', 'Reisekosten', 'Klassenfahrt', 'Vorteilsannahme'],
  },
  {
    id: 'chunk-wander-baden',
    docId: 'doc-wanderrichtlinie',
    docShortTitle: 'Wanderrichtlinie',
    category: 'fahrten',
    paragraph: 'Wanderrichtlinie Ziff. 6',
    sectionTitle: 'Baden & Schwimmen während Schulfahrten',
    text: `(1) Das Baden und Schwimmen während Schulfahrten ist nur an dafür behördlich freigegebenen und bewachten Badestellen (Schwimmbäder, Strandbäder mit Badeaufsicht) gestattet. Baden in unbewachten offenen Gewässern, Flüssen oder Baggerseen ist grundsätzlich verboten.
(2) Voraussetzungen für die Teilnahme der Schüler:
- Schriftliche Einverständniserklärung der Eltern mit Angabe der Schwimmfähigkeit (Freischwimmer / Bronze / Silber),
- Ausreichende Aufsicht durch Lehrkräfte oder Begleitpersonen, wobei mindestens eine Aufsichtsperson die Rettungsfähigkeit (mindestens DLRG-Rettungsschwimmabzeichen Bronze, an offenen Gewässern Silber) nachweisen muss.
(3) Nichtschwimmer sind gesondert zu beaufsichtigen und dürfen den Nichtschwimmerbereich nicht verlassen.`,
    summary: 'Baden nur an bewachten Badestellen! Verbot in unbewachten Gewässern. Pflicht: Schriftliche Badeerlaubnis der Eltern + Rettungsschwimmabzeichen (mind. Bronze, offene Gewässer Silber).',
    keyTakeaways: [
      'Badeverbot in unbewachten Gewässern, Flüssen und Baggerseen',
      'Schriftliche Einverständniserklärung der Eltern mit Schwimmabzeichen-Angabe',
      'Aufsichtsperson mit gültigem Rettungsschwimmer (DLRG Bronze / Silber)'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/schulleben/schulfahrten',
    tags: ['Baden', 'Schwimmen', 'Klassenfahrt', 'Rettungsschwimmer', 'DLRG', 'Aufsichtspflicht'],
  },

  // ==========================================
  // SICHERHEIT IM UNTERRICHT (RISU & UKT)
  // ==========================================
  {
    id: 'chunk-risu-gefahrstoffe',
    docId: 'doc-risu',
    docShortTitle: 'RISU / UKT',
    category: 'sicherheit',
    paragraph: 'RISU Abschnitt I-3 & I-4',
    sectionTitle: 'Gefahrstoffverzeichnis (DEGINTU), Substitutionsprüfung & Schutzbrillen',
    text: `(1) Jede Schule muss ein stets aktuelles Verzeichnis aller vorhandenen Gefahrstoffe führen (in Thüringen verbindlich über die Online-Datenbank DEGINTU). Das Verzeichnis ist jährlich zu überprüfen.
(2) Vor jeder Verwendung von Gefahrstoffen ist eine Substitutionsprüfung durchzuführen: Kann der Stoff durch einen weniger gefährlichen Stoff oder ein ungefährlicheres Experiment ersetzt werden?
(3) Beim Umgang mit ätzenden, reizenden oder spritzenden Gefahrstoffen sowie bei allen chemischen Experimenten mit Erwärmung oder Druckentwicklung besteht für Lehrkräfte und Schüler ausnahmslose SCHUTZBRILLENPFLICHT (auch für Brillenträger mit Überbrille).
(4) Vor der ersten praktischen Arbeit im Schuljahr und vor jedem potenziell gefährlichen Experiment ist eine dokumentierte Sicherheitsunterweisung der Schüler durchzuführen.`,
    summary: 'DEGINTU-Gefahrstoffkataster ist Pflicht. Strikte Substitutionsprüfung vor Versuchen. Ausnahmslose Schutzbrillenpflicht bei Versuchen mit Chemikalien/Spritzgefahr. Dokumentierte Schülerunterweisung.',
    keyTakeaways: [
      'Aktuelles Gefahrstoffkataster via DEGINTU verbindlich vorgeschrieben',
      'Substitutionsprüfung: Vorrang ungefährlicher Stoffe',
      'Ausnahmslose Schutzbrillenpflicht für alle Beteiligten im Raum',
      'Dokumentierte Sicherheitsbelehrung vorab zwingend'
    ],
    officialAnchorUrl: 'https://www.ukt.de/praevention/schulen-und-kindertageseinrichtungen/arbeitsschutz-in-der-schule',
    tags: ['RISU', 'Gefahrstoffe', 'Schutzbrille', 'DEGINTU', 'Substitutionsprüfung', 'Chemieraum'],
  },
  {
    id: 'chunk-risu-lagerung-abzug',
    docId: 'doc-risu',
    docShortTitle: 'RISU / UKT',
    category: 'sicherheit',
    paragraph: 'RISU Abschnitt I-5 & II-2',
    sectionTitle: 'Lagerung von Chemikalien, Giftschrank & Abzugspflicht',
    text: `(1) Chemikalien dürfen nicht in Unterrichtsräumen gelagert werden, sondern ausschließlich in gesicherten Vorbereitungs- und Sammlungsräumen. Diese Räume müssen stets verschlossen sein. Schüler dürfen sie nur unter direkter Aufsicht einer Fachlehrkraft betreten.
(2) Giftige, sehr giftige (akut toxische Kategorie 1–3) sowie krebserzeugende oder erbgutverändernde Stoffe müssen unter Verschluss in einem separaten Giftschrank aufbewahrt werden, dessen Schlüssel nur Fachlehrern zugänglich ist.
(3) Säuren und Laugen sind getrennt voneinander in korrosionsbeständigen Sicherheitsschränken mit kontinuierlicher Abluft zu lagern. Brennbare Flüssigkeiten sind in F90-Sicherheitsschränken aufzubewahren.
(4) Experimente, bei denen giftige, ätzende oder übelriechende Gase, Dämpfe oder Rauche entstehen, dürfen AUSSCHLIESSLICH im funktionierenden Abzug durchgeführt werden. Der Abzug muss eine gültige Prüfplakette (jährliche Prüfung) aufweisen.`,
    summary: 'Sammlungsräume stets verschlossen! Giftschrank unter separatem Verschluss. Säuren und Laugen getrennt lagern. Brennbare Stoffe im F90-Schrank. Gas-/Rauchentwicklung nur im geprüften Abzug.',
    keyTakeaways: [
      'Sammlungsräume dürfen für Schüler niemals frei zugänglich sein',
      'Giftschrankpflicht für akut toxische und CMR-Stoffe',
      'Getrennte Lagerung von Säuren und Laugen in Abluftschränken',
      'Abzugspflicht bei Gas- und Rauchentwicklung mit jährlicher Prüfplakette'
    ],
    officialAnchorUrl: 'https://www.ukt.de/praevention/schulen-und-kindertageseinrichtungen/arbeitsschutz-in-der-schule',
    tags: ['RISU', 'Chemikalienlagerung', 'Giftschrank', 'Abzug', 'Säuren und Laugen', 'F90'],
  },
  {
    id: 'chunk-risu-unfallkasse',
    docId: 'doc-risu',
    docShortTitle: 'RISU / UKT',
    category: 'sicherheit',
    paragraph: 'UKT Vorschrift 81 & DGUV',
    sectionTitle: 'Erste Hilfe & Unfallanzeige an die Unfallkasse Thüringen (UKT)',
    text: `(1) Schüler stehen bei schulischen Veranstaltungen und auf den direkten Wegen unter dem Schutz der gesetzlichen Unfallversicherung bei der Unfallkasse Thüringen (UKT).
(2) Jeder Schulunfall, bei dem eine ärztliche Behandlung erforderlich wird oder eine Arbeits-/Schulunfähigkeit von mehr als drei Kalendertagen eintritt, ist binnen DREI TAGEN mit dem amtlichen Unfallanzeige-Formular an die UKT zu melden.
(3) Bei kleineren Verletzungen, die keine sofortige Arztkonsultation erfordern, ist ein Eintrag in das Verbandbuch der Schule vorzunehmen (Datum, Uhrzeit, Verletzung, Hergang, Ersthelfer). Dies sichert Spätfolgen ab.`,
    summary: 'Unfallschutz über UKT. Meldepflicht bei Arztbehandlung oder >3 Tagen Ausfall: Anzeige binnen 3 Tagen an die UKT. Bei Bagatellen: Zwingender Eintrag ins Verbandbuch zur Beweissicherung.',
    keyTakeaways: [
      'Gesetzlicher UKT-Unfallschutz auf Schulgelände und Schulwegen',
      'Unfallanzeige an die UKT binnen 3 Tagen bei Arztbesuch',
      'Verbandbucheintrag bei jeder noch so kleinen Erstversorgung'
    ],
    officialAnchorUrl: 'https://www.ukt.de/service/unfall-was-nun',
    tags: ['UKT', 'Unfallkasse', 'Unfallanzeige', 'Erste Hilfe', 'Verbandbuch', '3-Tage-Frist'],
  },

  // ==========================================
  // LEHRAMTSAUSBILDUNG (LAA / ThürAZStPLVO)
  // ==========================================
  {
    id: 'chunk-laa-1',
    docId: 'doc-laa-thueringen',
    docShortTitle: 'ThürAZStPLVO (LAA)',
    category: 'ausbildung',
    paragraph: 'ThürAZStPLVO §§ 10, 11',
    sectionTitle: 'Vorbereitungsdienst an Regelschulen & Unterrichtsstunden',
    text: `(1) Der Vorbereitungsdienst für das Lehramt an Regelschulen dauert in Thüringen in der Regel 24 Monate. Er gliedert sich in die Ausbildung am Staatlichen Studienseminar und die schulpraktische Ausbildung an der zugewiesenen Ausbildungsschule.
(2) Die Ausbildung an der Schule umfasst:
- Hospitationen (Beobachtung von Unterricht erfahrener Lehrkräfte),
- angeleiteten Unterricht (gemeinsame Planung und Durchführung mit dem Ausbildungslehrer/Mentor),
- eigenverantwortlichen (selbstständigen) Unterricht.
(3) Der eigenverantwortliche Unterricht beträgt nach der Eingangsphase in der Regel zwischen 10 und maximal 14 Wochenstunden. Ein Einsatz darüber hinaus als Vertretungskraft ist nur in engen pädagogischen Grenzen zulässig und darf den Ausbildungserfolg nicht gefährden.`,
    summary: 'Vorbereitungsdienst Regelschule: 24 Monate. Unterricht: Hospitation, angeleitet und selbstständig. Selbstständiger Unterricht: 10 bis 14 Wochenstunden. Schutz vor übermäßiger Vertretung.',
    keyTakeaways: [
      'Regeldauer 24 Monate Vorbereitungsdienst',
      'Dreiklang: Hospitation, angeleiteter und eigenverantwortlicher Unterricht',
      'Deputat eigenverantwortlicher Unterricht: 10 bis 14 Stunden wöchentlich',
      'Ausbildungsschutz vor reinem Vertretungseinsatz'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbStPrVTHpP10',
    tags: ['LAA', 'Referendariat', 'Vorbereitungsdienst', 'Regelschule', 'Stundenzahl', 'Unterrichtsdeputat'],
  },
  {
    id: 'chunk-laa-mentoring',
    docId: 'doc-laa-thueringen',
    docShortTitle: 'ThürAZStPLVO (LAA)',
    category: 'ausbildung',
    paragraph: 'ThürAZStPLVO § 12',
    sectionTitle: 'Rolle und Aufgaben des Mentors / Ausbildungslehrers',
    text: `(1) Die Schulleitung bestellt für jeden Lehramtsanwärter in Abstimmung mit den Fachkonferenzen erfahrene Lehrkräfte als Mentoren (Ausbildungslehrer) für die jeweiligen Unterrichtsfächer.
(2) Aufgaben des Mentors:
- Unterstützung bei der didaktischen und methodischen Unterrichtsplanung,
- Regelmäßige Unterrichtsbeobachtung mit konstruktivem Feedback,
- Einführung in schulinterne Abläufe (Notengebung, Konferenzen, Elterngespräche, Fachräume),
- Teilnahme an Beratungsbesuchen der Fachleiter des Studienseminars.
(3) Mentoren erhalten für ihre Tätigkeit in der Regel eine Anrechnungs-/Entlastungsstunde im Rahmen der schulischen ZPVI-Verteilung.`,
    summary: 'Mentoren begleiten LAA in ihren Fächern. Aufgaben: Unterrichtsplanung, Hospitationen mit Feedback, schulische Abläufe. Mentoren erhalten dafür in der Regel Entlastungsstunden.',
    keyTakeaways: [
      'Bestellung durch Schulleitung für jedes Fach',
      'Wöchentliche Beratungs- und Reflexionsgespräche',
      'Begleitung bei Unterrichtsbesuchen des Seminars',
      'Entlastungsstunde für den Mentor nach ZPVI'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbStPrVTHpP12',
    tags: ['Mentor', 'Ausbildungslehrer', 'LAA', 'Feedback', 'Entlastungsstunde'],
  },

  // ==========================================
  // SEITENEINSTEIGER & QUALIFIZIERUNG
  // ==========================================
  {
    id: 'chunk-seiteneinsteiger-1',
    docId: 'doc-seiteneinsteiger',
    docShortTitle: 'Seiteneinsteiger-Richtlinie',
    category: 'ausbildung',
    paragraph: 'TMBJS Richtlinie Seiteneinstieg Ziff. 3',
    sectionTitle: 'Der 3-monatige Vorkurs des ThILLM (Schutzraum)',
    text: `(1) Neu eingestellte Seiteneinsteigerinnen und Seiteneinsteiger ohne Lehramtsbefähigung absolvieren unmittelbar nach der Einstellung einen verpflichtenden dreimonatigen (12-wöchigen) Vorkurs am Thüringer Institut für Lehrerfortbildung, Lehrplanentwicklung und Medien (ThILLM).
(2) Dieser Vorkurs fungiert als pädagogischer Schutzraum: Die Teilnehmer erwerben Grundkompetenzen in Didaktik, Klassenführung, Diagnostik und Schulrecht.
(3) Während der ersten drei Monate findet in der Regel noch kein eigenverantwortlicher Alleinunterricht an der Regelschule statt, sondern begleitete Hospitationen und Team-Teaching mit erfahrenen Lehrkräften der Schule.`,
    summary: 'Seiteneinsteiger starten mit einem 3-monatigen Pflicht-Vorkurs des ThILLM. In dieser Zeit kein Alleinunterricht, sondern Hospitationen und Grundlagenerwerb als geschütztes Onboarding.',
    keyTakeaways: [
      'Verpflichtender 3-monatiger (12 Wochen) ThILLM-Vorkurs vor vollem Unterrichtseinsatz',
      'Schutzraum-Prinzip: Pädagogische Grundlagen vor Alleinverantwortung',
      'Hospitationen und Team-Teaching an der Regelschule'
    ],
    officialAnchorUrl: 'https://lehrerinthueringen.de/seiteneinstieg',
    tags: ['Seiteneinsteiger', 'ThILLM', 'Vorkurs', 'Schutzraum', 'Onboarding', 'Regelschule'],
  },
  {
    id: 'chunk-seiteneinsteiger-2',
    docId: 'doc-seiteneinsteiger',
    docShortTitle: 'Seiteneinsteiger-Richtlinie',
    category: 'ausbildung',
    paragraph: 'TMBJS Richtlinie Seiteneinstieg Ziff. 5 & 6',
    sectionTitle: 'Pädagogische Nachqualifizierung & Mentoring an der Schule',
    text: `(1) Im Anschluss an den Vorkurs treten Seiteneinsteiger in die berufsbegleitende pädagogisch-praktische Nachqualifizierung (Dauer je nach Fach 12 bis 24 Monate) ein.
(2) Zur Absicherung der Studienteilnahme an Modulen und Fortbildungstagen erhalten Seiteneinsteiger eine Stundenfreistellung (Absenkung der Unterrichtsverpflichtung).
(3) An der Ausbildungsschule wird ein erfahrener Betreuungslehrer (Mentor) benannt, der den Seiteneinsteiger bei der täglichen Unterrichtsvorbereitung, Leistungsbewertung und Elternkommunikation engmaschig unterstützt.`,
    summary: 'Nach dem Vorkurs: 12-24 Monate Nachqualifizierung mit Freistellungsstunden. Fester Mentor an der Regelschule zur kontinuierlichen Begleitung im Schulalltag.',
    keyTakeaways: [
      '12 bis 24 Monate berufsbegleitende Qualifizierung',
      'Stundenfreistellung zur Fortbildungsteilnahme',
      'Engmaschige Betreuung durch schulischen Mentor'
    ],
    officialAnchorUrl: 'https://lehrerinthueringen.de/seiteneinstieg',
    tags: ['Seiteneinsteiger', 'Nachqualifizierung', 'Mentor', 'Freistellung', 'ThILLM'],
  },

  // ==========================================
  // DUALES LEHRAMTSSTUDIUM
  // ==========================================
  {
    id: 'chunk-duales-studium-1',
    docId: 'doc-duales-studium',
    docShortTitle: 'Duales Studium TMBJS',
    category: 'ausbildung',
    paragraph: 'Rahmenplan Duales Studium Regelschule Ziff. 2',
    sectionTitle: 'Praxistage (Montag & Freitag) an der Regelschule',
    text: `(1) Das duale Lehramtsstudium für Regelschulen (Universität Erfurt in Kooperation mit dem TMBJS) bindet Studierende ab dem 3. Fachsemester fest in den Schulalltag ein.
(2) Wöchentlicher Rhythmus:
- Dienstag, Mittwoch, Donnerstag: Lehrveranstaltungen an der Universität Erfurt,
- Montag und Freitag: Feste Praxistage an der zugewiesenen Regelschule vor Ort.
(3) An den Praxistagen begleiten die Studierenden den Fachunterricht, leiten Übungsphasen, unterstützen Fördermaßnahmen und übernehmen mit fortschreitendem Studium unter Anleitung erste eigene Unterrichtsstunden.`,
    summary: 'Duales Lehramtsstudium Regelschule: Ab 3. Semester Di-Do Uni Erfurt, Mo und Fr feste Praxistage an der Regelschule vor Ort. Zunehmend eigener Unterricht unter Mentorenbegleitung.',
    keyTakeaways: [
      'Feste Praxistage an der Regelschule: Montag und Freitag',
      'Dienstag bis Donnerstag: Universitätsvorlesungen und Seminare',
      'Feste Integration in das Regelschulkollegium von Beginn an'
    ],
    officialAnchorUrl: 'https://lehrerinthueringen.de/duales-studium',
    tags: ['Duales Studium', 'Praxistage', 'Montag und Freitag', 'Uni Erfurt', 'Regelschule'],
  },
  {
    id: 'chunk-duales-studium-2',
    docId: 'doc-duales-studium',
    docShortTitle: 'Duales Studium TMBJS',
    category: 'ausbildung',
    paragraph: 'Rahmenplan Duales Studium Regelschule Ziff. 4',
    sectionTitle: 'Vergütung, Dienstvertrag & verkürzter Vorbereitungsdienst',
    text: `(1) Dual Studierende schließen einen Studien- und Ausbildungsvertrag mit dem Freistaat Thüringen ab. Sie erhalten eine monatliche Vergütung (ca. 1.550 € im Bachelor, ca. 1.800 € im Master) sowie die Übernahme der Semesterbeiträge.
(2) Nach erfolgreichem Masterabschluss schließt sich ein auf 12 Monate verkürzter Vorbereitungsdienst (statt regulär 24 Monate) an, da umfangreiche Schulpraxis bereits im Studium absolviert wurde.
(3) Im Gegenzug verpflichten sich die Absolventen zu einer mindestens fünfjährigen Tätigkeit im Thüringer staatlichen Schuldienst.`,
    summary: 'Vergütung: 1.550 € (Bachelor) / 1.800 € (Master). Nach Masterabschluss: Verkürztes Referendariat auf 12 Monate. 5 Jahre Bindung an den Thüringer Schuldienst.',
    keyTakeaways: [
      'Attraktive monatliche Vergütung durch das Land Thüringen',
      'Verkürzung des Vorbereitungsdienstes auf 12 Monate',
      '5-jährige Verpflichtung für den Thüringer Schuldienst'
    ],
    officialAnchorUrl: 'https://lehrerinthueringen.de/duales-studium',
    tags: ['Duales Studium', 'Vergütung', 'Verkürztes Referendariat', '12 Monate', 'Vertrag'],
  },

  // ==========================================
  // ARBEITSZEIT & PFLICHTSTUNDEN (ThürLehrAzVO)
  // ==========================================
  {
    id: 'chunk-azvo-regelschule',
    docId: 'doc-thuerlehrazvo',
    docShortTitle: 'ThürLehrAzVO',
    category: 'dienstrecht',
    paragraph: '§ 4 Abs. 1 Nr. 2 ThürLehrAzVO',
    sectionTitle: 'Pflichtstundenzahl an Thüringer Regelschulen (26 Wochenstunden)',
    text: `(1) Die wöchentliche Pflichtstundenzahl der beamteten und angestellten Lehrkräfte an staatlichen Schulen beträgt im Rahmen der regelmäßigen 40-Stunden-Woche:
- an Regelschulen in den Klassenstufen 5 bis 10: 26 Pflichtstunden.
(Zum Vergleich: Grundschulen 27 Stunden, Förderschulen 26 Stunden, Gymnasien 26 bzw. 25 Stunden).
(2) Eine Unterrichtsstunde beträgt 45 Minuten. Zur Unterrichtsverpflichtung gehören neben den Unterrichtsstunden auch die damit verbundene Vor- und Nachbereitung, Korrekturen, Konferenzen, Pausenaufsichten und Elterngespräche.`,
    summary: '§ 4 Abs. 1 Nr. 2 ThürLehrAzVO legt für Lehrkräfte an Regelschulen (Klassen 5-10) verbindlich 26 Pflichtstunden wöchentlich fest. Jahresarbeitszeit basiert auf 40h-Woche.',
    keyTakeaways: [
      'Verbindliche Regelpflichtstundenzahl: 26 Unterrichtsstunden pro Woche an der Regelschule',
      'Enthalten: 45-Minuten-Taktung zuzüglich Vor-/Nachbereitung und Dienstgeschäfte',
      'Basis: 40-Stunden-Woche im Jahresdurchschnitt'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrArbZVO2006THpP4',
    tags: ['ThürLehrAzVO', '26 Pflichtstunden', 'Regelschule', 'Deputat', 'Arbeitszeit'],
  },
  {
    id: 'chunk-azvo-altersabminderung',
    docId: 'doc-thuerlehrazvo',
    docShortTitle: 'ThürLehrAzVO',
    category: 'dienstrecht',
    paragraph: '§ 7 ThürLehrAzVO',
    sectionTitle: 'Altersermäßigung & Entlastungsstunden',
    text: `(1) Lehrkräften wird auf Antrag oder von Amts wegen eine Ermäßigung der wöchentlichen Pflichtstundenzahl aus Altersgründen gewährt:
- ab dem Beginn des Schuljahres, das auf die Vollendung des 55. Lebensjahres folgt: um 1 Pflichtstunde,
- ab dem Beginn des Schuljahres, das auf die Vollendung des 60. Lebensjahres folgt: um weitere Pflichtstunden nach den ministeriellen Verwaltungsvorschriften.
(2) Zusätzliche Entlastungsstunden werden vergeben für Funktionsstellen (Schulleitung, Stellvertretung), Klassenleitungen, Fachberater, Gefahrstoffbeauftragte und Mitglieder des Personalrats.`,
    summary: 'Altersermäßigung ab 55. Lebensjahr (1 Stunde) und ab 60. Lebensjahr. Entlastungsstunden für Klassenleitung, Schulleitung, Gefahrstoffbeauftragte und Personalrat.',
    keyTakeaways: [
      'Altersermäßigung ab dem auf das 55. Lebensjahr folgenden Schuljahr (1 Stunde)',
      'Weitere Reduzierung ab 60. Lebensjahr',
      'Funktionsstunden für Klassenleitung und Sicherheitsbeauftragte'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-LehrArbZVO2006THpP7',
    tags: ['Altersermäßigung', '55. Lebensjahr', 'Entlastungsstunden', 'Klassenlehrerstunde', 'ThürLehrAzVO'],
  },

  // ==========================================
  // MITBESTIMMUNG & PERSONALRAT (ThürPersVG)
  // ==========================================
  {
    id: 'chunk-persvg-mitbestimmung',
    docId: 'doc-thuerpersvg',
    docShortTitle: 'ThürPersVG',
    category: 'dienstrecht',
    paragraph: '§§ 68, 73 ThürPersVG',
    sectionTitle: 'Mitbestimmungsrechte des Personalrats (ÖPR) an Schulen',
    text: `(1) Der Örtliche Personalrat (ÖPR) an der Schule bestimmt mit bei:
- Grundsätzen der Verteilung der Wochenarbeitszeit und der Stundenplangestaltung,
- der Aufstellung und Änderung des Aufsichtsplans (Pausenaufsichten),
- Grundsätzen der Urlaubs- und Vertretungsplanung,
- der Anordnung von Mehrarbeit (Überstunden) über die gesetzlichen Freigrenzen hinaus.
(2) Maßnahmen, die der Mitbestimmung unterliegen, dürfen erst durchgeführt werden, wenn der ÖPR zugestimmt hat oder das personalvertretungsrechtliche Stufenverfahren abgeschlossen ist.`,
    summary: 'ÖPR bestimmt mit bei Aufsichtsplänen, Stundenplangrundsätzen, Vertretungsregelungen und Mehrarbeit. Schulleitung muss Zustimmung rechtzeitig vor Inkrafttreten einholen.',
    keyTakeaways: [
      'Mitbestimmung bei Pausenaufsichtsplänen und Stundenplangrundsätzen',
      'Zustimmungspflicht bei Anordnung von Mehrarbeit',
      'Schutz vor willkürlicher Arbeitszeitverschiebung'
    ],
    officialAnchorUrl: 'https://landesrecht.thueringen.de/bsth/document/jlr-PersVGTH2019pP68',
    tags: ['ÖPR', 'Personalrat', 'Mitbestimmung', 'Aufsichtsplan', 'Mehrarbeit', 'ThürPersVG'],
  },

  // ==========================================
  // DATENSCHUTZ & DIGITALE MEDIEN
  // ==========================================
  {
    id: 'chunk-datenschutz-ipad',
    docId: 'doc-datenschutz',
    docShortTitle: 'Datenschutz Thüringen',
    category: 'datenschutz',
    paragraph: 'ThürDSG & TMBJS Handreichung Ziff. 4',
    sectionTitle: 'Notenlisten, Dienst-iPads & Cloud-Dienste',
    text: `(1) Personenbezogene Daten von Schülern (insbesondere Namen, Noten, Zeugnisbemerkungen, Fehlzeiten und Gutachten) dürfen nur auf dienstlichen Endgeräten (Dienst-iPads) verarbeitet werden, die durch PIN/Passwort und Verschlüsselung gesichert sind.
(2) Die Speicherung von personenbezogenen Schülerdaten auf privaten Clouddiensten (z. B. privates iCloud, Google Drive, Dropbox) ist streng untersagt. Es dürfen ausschließlich landesseitig freigegebene Systeme (z. B. Thüringer Schulportal, Thüringer Schulcloud) genutzt werden.
(3) Bei Verlust eines Dienst-iPads ist unverzüglich die Schulleitung und der behördliche Datenschutzbeauftragte zu informieren, um eine Fernlöschung über das MDM (Mobile Device Management) zu veranlassen.`,
    summary: 'Noten und Schülerdaten nur verschlüsselt auf Dienstgeräten. Verbot privater Cloud-Dienste (Dropbox, privates iCloud). Nutzung der freigegebenen Thüringer Schulcloud. Meldung bei iPad-Verlust.',
    keyTakeaways: [
      'Strikte Verschlüsselungs- und Passcode-Pflicht auf Dienst-iPads',
      'Absolutes Verbot privater Cloud-Speicher für Noten und Schülerdaten',
      'Nutzung offizieller Landesdienste (Thüringer Schulportal)',
      'Meldepflicht bei Geräteverlust zur MDM-Fernlöschung'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/digitalisierung/datenschutz',
    tags: ['Datenschutz', 'Dienst-iPad', 'Notenlisten', 'MDM', 'Cloud-Verbot', 'ThürDSG'],
  },
  {
    id: 'chunk-datenschutz-fotos',
    docId: 'doc-datenschutz',
    docShortTitle: 'Datenschutz Thüringen',
    category: 'datenschutz',
    paragraph: 'Art. 6 DSGVO & ThürDSG § 12',
    sectionTitle: 'Schülerfotos & Videoaufnahmen bei Schulfesten',
    text: `(1) Das Erstellen und Veröffentlichen von Fotos und Videos von Schülerinnen und Schülern (z. B. auf der Schulhomepage, in der Schülerzeitung oder in Pressemitteilungen) ist nur mit vorheriger, ausdrücklicher und schriftlicher Einwilligung der Erziehungsberechtigten (sowie ab dem 14. Lebensjahr auch des Schülers selbst) zulässig.
(2) Die Einwilligung ist freiwillig und kann jederzeit für die Zukunft widerrufen werden.
(3) Bei der Veröffentlichung auf der Homepage oder Social-Media-Kanälen der Schule dürfen Fotos von Schülern grundsätzlich nicht mit vollem Vor- und Nachnamen verknüpft werden.`,
    summary: 'Fotos von Schülern erfordern schriftliche Einwilligung der Eltern (ab 14 Jahren auch des Schülers). Einwilligung ist widerrufbar. Keine Nennung von vollen Namen bei Fotos.',
    keyTakeaways: [
      'Schriftliche Fotoeinwilligung der Erziehungsberechtigten zwingend',
      'Ab 14 Jahren muss der Schüler selbst mit einwilligen',
      'Verbot der Nennung voller Schülernamen im Internet'
    ],
    officialAnchorUrl: 'https://bildung.thueringen.de/schule/digitalisierung/datenschutz',
    tags: ['Fotos', 'DSGVO', 'Einwilligung', 'Schulhomepage', 'Datenschutz'],
  },

  // ==========================================
  // HEIMBÜRGESCHULE KAHLA SPEZIFIKA
  // ==========================================
  {
    id: 'chunk-hbs-hausordnung-handy',
    docId: 'doc-hbs-intern',
    docShortTitle: 'HBS Hausordnung',
    category: 'hbs_intern',
    paragraph: 'Hausordnung HBS Kahla § 3',
    sectionTitle: 'Smartphone- und Smartwatch-Nutzung an der Heimbürgeschule',
    text: `(1) Zur Förderung eines störungsfreien Lernklimas und des sozialen Miteinanders bleiben Smartphones, Smartwatches und private elektronische Unterhaltungsgeräte während der gesamten Schulzeit auf dem gesamten Schulgelände und im Schulgebäude AUSGESCHALTET oder LAUTLOS in der Schultasche.
(2) Eine Nutzung privater Smartphones im Unterricht ist nur gestattet, wenn die jeweilige Fachlehrkraft dies ausdrücklich zu unterrichtlichen Zwecken (z. B. Recherche, Quiz, Fachapp) anordnet.
(3) Bei Verstößen gegen diese Regelung wird das Smartphone durch die Lehrkraft nach § 51 Abs. 1 ThürSchulG zeitweise eingezogen und im Sekretariat deponiert. Das Gerät kann am Ende des Schultages vom Schüler (oder bei wiederholten Verstößen durch die Erziehungsberechtigten) im Schulleitungssekretariat abgeholt werden.`,
    summary: 'Smartphones an der HBS Kahla im Ranzen ausgeschaltet. Nutzung nur bei ausdrücklicher Lehreranweisung für den Unterricht. Bei Verstoß: Vorübergehender Einzug nach § 51 Abs. 1 ThürSchulG ins Sekretariat.',
    keyTakeaways: [
      'Grundsätzliches Smartphone-Verbot während des Schultages (Ranzen-Regel)',
      'Ausnahme nur bei didaktischer Freigabe durch die Fachlehrkraft',
      'Einbehaltene Geräte werden im Sekretariat hinterlegt',
      'Rückgabe nach Unterrichtsende oder durch Eltern bei Wiederholung'
    ],
    officialAnchorUrl: '#hbs-intern-handy',
    tags: ['Hausordnung', 'Heimbürgeschule', 'Smartphone', 'Handyordnung', '§ 51 ThürSchulG'],
  },
  {
    id: 'chunk-hbs-pausen-aufsicht',
    docId: 'doc-hbs-intern',
    docShortTitle: 'HBS Hausordnung',
    category: 'hbs_intern',
    paragraph: 'HBS Aufsichtsordnung § 2',
    sectionTitle: 'Pausen- und Hofaufsichtsbereiche Heimbürgeschule',
    text: `(1) In den großen Pausen (Hofpausen) begeben sich alle Schülerinnen und Schüler auf den Schulhof. Das Verweilen auf den Fluren und in den Treppenhäusern ist untersagt.
(2) Die eingeteilten Lehrkräfte übernehmen die Aufsicht pünktlich mit dem Gongschlag in den festgelegten Zonen:
- Zone 1: Hauptschulhof / Sportbereich,
- Zone 2: Grünfläche / Tischtennisplatten,
- Zone 3: Eingangsbereich / Foyer,
- Zone 4: Flur- und Toilettenbereich (Innenaufsicht).
(3) Bei Regenpause (Signalton durch Schulleitung / Sekretariat) verbleiben die Schülerinnen und Schüler in ihren Unterrichtsräumen. Die Aufsicht wird durch die Flur- und Fachraumaufsichten wahrgenommen.`,
    summary: 'Hofpause: Alle Schüler auf den Hof. Pünktliche Übernahme der Aufsichtszonen 1 bis 4. Bei Regenpause verbleiben Schüler im Klassenraum unter Fluraufsicht.',
    keyTakeaways: [
      'Pünktliche Aufsichtsübernahme mit dem Pausengong',
      'Feste Zoneneinteilung laut schulweitem Aufsichtsplan',
      'Geregelter Ablauf bei Regenpausen im Schulhaus'
    ],
    officialAnchorUrl: '#hbs-intern-aufsicht',
    tags: ['Pausenaufsicht', 'Heimbürgeschule', 'Hofpause', 'Aufsichtsplan', 'Regenpause'],
  },
  {
    id: 'chunk-hbs-krisenteam',
    docId: 'doc-hbs-intern',
    docShortTitle: 'HBS Hausordnung',
    category: 'hbs_intern',
    paragraph: 'HBS Krisenleitfaden Ziff. 1',
    sectionTitle: 'Krisenteam & Notfallmaßnahmen Heimbürgeschule',
    text: `(1) An der Heimbürgeschule besteht ein ständiges Krisenteam (Schulleitung, Sicherheitsbeauftragter, Beratungslehrer, Schulsozialarbeiter, Ersthelfer).
(2) Bei schweren Vorfällen (Androhung von Gewalt, schwerer Unfall, Brandfall, akute Gefährdung) ist sofort das Schulleitungssekretariat zu alarmieren.
(3) Bei Feueralarm (akustisches Dauersignal) verlassen alle Klassen geordnet nach Fluchtwegeplan über die gekennzeichneten Notausgänge das Gebäude und finden sich am Sammelplatz (Sportplatz) ein. Die Vollzähligkeit wird anhand des Klassenbuches überprüft und der Schulleitung gemeldet.`,
    summary: 'Krisenteam an der HBS Kahla. Sofortige Meldung an Schulleitung. Bei Alarm: Geordneter Fluchtweg zum Sammelplatz Sportplatz, Vollzähligkeitsprüfung über Klassenbuch.',
    keyTakeaways: [
      'Krisenteam: Schulleitung, Beratungslehrer, Schulsozialarbeit, Ersthelfer',
      'Notfallalarm: Evakuierung zum Sammelplatz Sportplatz',
      'Vollzähligkeitskontrolle über Klassenbuch und Rückmeldung an Schulleitung'
    ],
    officialAnchorUrl: '#hbs-intern-krisenteam',
    tags: ['Krisenteam', 'Notfall', 'Feueralarm', 'Heimbürgeschule', 'Sammelplatz'],
  },
];
