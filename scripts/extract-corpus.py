#!/usr/bin/env python3
"""
Extrahiert alle Original-PDFs, DOCX-Dokumente (docs/originals/, docs/hbs_intern/)
sowie ergänzende kuratierte Vorschriften (docs/laws/) in einen einheitlichen,
paragraphen- und seitengenauen JSON-Korpus für das Embedding-Skript.
"""

import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import pypdf

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ORIGINALS_DIR = PROJECT_ROOT / "docs" / "originals"
HBS_INTERN_DIR = PROJECT_ROOT / "docs" / "hbs_intern"
LAWS_DIR = PROJECT_ROOT / "docs" / "laws"
OUT_PATH = PROJECT_ROOT / "scripts" / ".extracted-corpus.json"


# Vollständiger Dokumentenkatalog: Alle echten Original-PDFs + HBS-Dokumente + ergänzende TXT-Normen
DOCUMENT_SPECS = [
    # --- 1. KERN-GESETZE & VERORDNUNGEN (Original-PDFs) ---
    {
        "source": ORIGINALS_DIR / "thueringer_schulgesetz.pdf",
        "id": "doc-thuerschulg",
        "title": "Thüringer Schulgesetz (ThürSchulG)",
        "shortTitle": "ThürSchulG",
        "legalBasis": "Thüringer Schulgesetz (gültig ab 1. August 2024, BildungTH.de)",
        "category": "schulrecht",
        "currentVersion": "Fassung gültig ab 1. August 2024 (Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003rahmen",
        "deepLinkBase": "https://landesrecht.thueringen.de/bsth/document/jlr-SchulGTH2003pP",
        "description": "Vollständiges Landesgesetz für Bildung, Schularten, Schulpflicht (§§ 17–24), Schüler-/Elternrechte, Konferenzen und Ordnungsmaßnahmen (§ 51).",
        "tags": ["ThürSchulG", "Schulgesetz", "Schulrecht", "Ordnungsmaßnahmen", "Schulpflicht", "Regelschule"],
        "mode": "law",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "thueringer_schulordnung.pdf",
        "id": "doc-thuerschulo",
        "title": "Thüringer Schulordnung (ThürSchulO)",
        "shortTitle": "ThürSchulO",
        "legalBasis": "Thüringer Schulordnung für Grund-, Regel-, Gemeinschaftsschule, Gymnasium, Gesamtschule & Förderschule",
        "category": "schulrecht",
        "currentVersion": "Gültigkeit ab 1. August 2025 (Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHrahmen",
        "deepLinkBase": "https://landesrecht.thueringen.de/bsth/document/jlr-SchulOTHpP",
        "description": "Vollständige Durchführungsverordnung: Klassenarbeiten (§ 56), Hausaufgaben (§ 57), Leistungsbewertung, Versetzung, Abschlüsse & Konferenzen.",
        "tags": ["ThürSchulO", "Schulordnung", "Klassenarbeiten", "Hausaufgaben", "Noten", "Versetzung", "Prüfungen"],
        "mode": "law",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Lehrerdienstordnung.pdf",
        "id": "doc-diensto-l",
        "title": "Dienstordnung für Lehrer, Erzieher und Sonderpädagogische Fachkräfte (DienstO-L)",
        "shortTitle": "DienstO-L",
        "legalBasis": "VVTH000011051 · Az. 21/03150 · Fassung vom 13.11.2023 (gültig bis 31.12.2028)",
        "category": "dienstrecht",
        "currentVersion": "Fassung 13.11.2023 (gültig 01.01.2024–31.12.2028, Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000011051",
        "description": "Verbindliche Dienstordnung zu Rechten/Pflichten, Aufsichtspflicht & Hausrecht (§ 8), Arbeitszeit, Mehrarbeit, Fortbildung, Abwesenheit und Verschwiegenheit.",
        "tags": ["DienstO-L", "Lehrerdienstordnung", "Aufsichtspflicht", "Hausrecht", "Abwesenheit", "Verschwiegenheit", "Dienstrecht"],
        "mode": "law",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "VVOrgS2627.pdf",
        "id": "doc-vvorg",
        "title": "Verwaltungsvorschrift zur Organisation des Schuljahres 2026/2027 (VVOrgS2627)",
        "shortTitle": "VVOrg 2026/2027",
        "legalBasis": "VV TMBWK vom 10. April 2026 (nichtamtliche Lesefassung)",
        "category": "organisation",
        "currentVersion": "Schuljahr 2026/2027 (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/organisation/vvorg",
        "description": "Aktuelle Schuljahresorganisation 2026/2027: Ressourcenzuweisung, ZPVI, Stundentafeln, Differenzierung, Fördermaßnahmen & Termine.",
        "tags": ["VVOrg", "VVOrgS2627", "Schulorganisation", "Stundentafeln", "ZPVI", "2026/2027"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "19_12_2024__VVTH-VVTH000011627.pdf",
        "id": "doc-vv-schulfahrten",
        "title": "Verwaltungsvorschrift für die Durchführung von Wandertagen und Klassenfahrten",
        "shortTitle": "VV Wandertage & Klassenfahrten",
        "legalBasis": "VVTH000011627 · Az. 3 4/0561 · Fassung vom 19.12.2024 (gültig bis 31.12.2026)",
        "category": "fahrten",
        "currentVersion": "Fassung 19.12.2024 (Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000011627",
        "description": "Verbindliche Vorgaben zu Planung, Dienstreisegenehmigung, Vertragsabschluss, Freiplatzverbot, Versicherung, Aufsicht und Reisekostenerstattung.",
        "tags": ["Wandertage", "Klassenfahrten", "Freiplatzverbot", "Dienstreise", "Aufsicht", "Reisekosten"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2023-09-21_Richtlinie_zur_Sicherheit_im_Unterricht_RiSU.pdf",
        "id": "doc-risu",
        "title": "Richtlinie zur Sicherheit im Unterricht (RiSU – KMK)",
        "shortTitle": "RiSU (KMK)",
        "legalBasis": "KMK-Empfehlung zur Sicherheit im Unterricht, Stand 21.09.2023 (295 Seiten)",
        "category": "sicherheit",
        "currentVersion": "KMK-Stand 21.09.2023 (Volltext)",
        "officialUrl": "https://www.kmk.org/themen/allgemeinbildende-schulen/weitere-themen/sicherheit-im-unterricht.html",
        "description": "Umfassende Sicherheitsrichtlinie für Naturwissenschaften (Chemie, Physik, Biologie), Technik/Werken, Gefahrstoffe, Laser, Strahlung und Erste Hilfe.",
        "tags": ["RiSU", "RISU", "Sicherheit", "Gefahrstoffe", "Chemie", "Physik", "Biologie", "Werken", "Schutzbrille", "Laser"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "05_05_2026__VVTH-VVTH000012245.pdf",
        "id": "doc-sicherheit-schulsport",
        "title": "Sicherheit im Schulsport (VVTH)",
        "shortTitle": "Sicherheit im Schulsport",
        "legalBasis": "VVTH000012245 · Az. 1020-23-5851/23-2 · Fassung vom 05.05.2026 (gültig bis 31.07.2031)",
        "category": "sicherheit",
        "currentVersion": "Fassung 05.05.2026 (gültig bis 31.07.2031)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000012245",
        "description": "Sicherheitsgrundsätze im Schulsport, Schwimmen/Baden, Sportstätten, Geräteprüfung, Aufsicht und Qualifikation von Sportlehrkräften.",
        "tags": ["Schulsport", "Sportunterricht", "Schwimmen", "Sicherheit", "Aufsicht", "Sportgeräte"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "12_10_2022__VVTH-VVTH000010176.pdf",
        "id": "doc-schulsportwettbewerbe",
        "title": "Organisation und Durchführung der Schulsportwettbewerbe in Thüringen",
        "shortTitle": "VV Schulsportwettbewerbe",
        "legalBasis": "VVTH000010176 · Az. 23/5854 · Fassung vom 12.10.2022",
        "category": "sicherheit",
        "currentVersion": "Fassung 12.10.2022 (Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000010176",
        "description": "Regelungen zu Schulsportwettbewerben (Jugend trainiert für Olympia), Meldung, Teilnahmeberechtigung, Versicherung und Aufsicht.",
        "tags": ["Schulsportwettbewerbe", "Sport", "Wettbewerb", "Jugend trainiert"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "12_02_2026__VVTH-VVTH000012114.pdf",
        "id": "doc-schulbudget",
        "title": "Durchführungsbestimmungen zur Umsetzung des Schulbudgets",
        "shortTitle": "VV Schulbudget",
        "legalBasis": "VVTH000012114 · Az. 1020-21-5148/10-1-24274 · Fassung vom 12.02.2026 (gültig 2026–2027)",
        "category": "organisation",
        "currentVersion": "Fassung 12.02.2026 (gültig bis 31.12.2027)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000012114",
        "description": "Haushaltsführung, Verwendungsmöglichkeiten des Schulbudgets, Verträge, Beschaffung und Nachweisführung an staatlichen Schulen.",
        "tags": ["Schulbudget", "Haushalt", "Finanzen", "Beschaffung", "Schulleitung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "17_11_2025__VVTH-VVTH000011950.pdf",
        "id": "doc-schuelerbegegnungen",
        "title": "Schülerbegegnungen im Rahmen internationaler Schul- und Projektpartnerschaften",
        "shortTitle": "VV Schülerbegegnungen",
        "legalBasis": "VVTH000011950 · Az. 36/5019-55 · Fassung vom 17.11.2025 (gültig bis 31.12.2030)",
        "category": "fahrten",
        "currentVersion": "Fassung 17.11.2025 (Volltext)",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/VVTH-VVTH000011950",
        "description": "Vorschriften für Schüleraustausch, Gastfamilien, internationale Projektpartnerschaften, Zuwendungen und Aufsichtspflicht im Ausland.",
        "tags": ["Schüleraustausch", "Schülerbegegnungen", "Ausland", "Schulpartnerschaft", "Fahrten"],
        "mode": "structured",
        "skipToc": True,
    },

    # --- 2. GEWALT, KINDERSCHUTZ & PRÄVENTION ---
    {
        "source": ORIGINALS_DIR / "Dienstanweisung_Umgang_mit_Gewalt_an_Schulen.pdf",
        "id": "doc-dienstanweisung-gewalt",
        "title": "Dienstanweisung zum Umgang mit Gewalt und sexualisierter Gewalt an Schulen",
        "shortTitle": "Dienstanweisung Gewalt & Kinderschutz",
        "legalBasis": "Dienstanweisung TMBWK/TMBJS · Stand: Mai 2026",
        "category": "sicherheit",
        "currentVersion": "Stand Mai 2026 (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Verbindliches Verfahren bei Gewalt, sexualisierter Gewalt, Kindeswohlgefährdung (§ 8a SGB VIII), IseF-Beratung, Meldepflichten und Schutzmaßnahmen.",
        "tags": ["Kinderschutz", "Gewalt", "Sexualisierte Gewalt", "§ 8a SGB VIII", "IseF", "Jugendamt", "Dienstanweisung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Checkliste_Kindeswohlgefaehrdung.pdf",
        "id": "doc-checkliste-kwg",
        "title": "Checkliste zur Einschätzung einer möglichen Kindeswohlgefährdung",
        "shortTitle": "Checkliste Kindeswohlgefährdung",
        "legalBasis": "Anlage / Arbeitshilfe Kinderschutz Thüringer Schulen",
        "category": "sicherheit",
        "currentVersion": "Aktuelle Arbeitshilfe",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Strukturierte Anhaltspunkte für Gefährdungsmerkmale (äußere Erscheinung, Verhalten, familiäre Situation) zur Risikoabschätzung.",
        "tags": ["Kindeswohlgefährdung", "Checkliste", "Kinderschutz", "Anhaltspunkte"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Verlaufsdokumentation_Kindeswohlgefaehrdung.pdf",
        "id": "doc-verlaufsdoku-kwg",
        "title": "Verlaufsdokumentation bei einer möglichen Kindeswohlgefährdung",
        "shortTitle": "Verlaufsdokumentation KWG",
        "legalBasis": "Amtlicher Dokumentationsbogen Kinderschutz an Thüringer Schulen",
        "category": "sicherheit",
        "currentVersion": "Aktueller Vordruck",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Dokumentationsstruktur für Beobachtungen, Elterngespräche, IseF-Einschaltung und Jugendamtsmeldung.",
        "tags": ["Verlaufsdokumentation", "Kindeswohlgefährdung", "Kinderschutz", "Dokumentation"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "2026_Umgang_mit_Extremismus_an_Schule.pdf",
        "id": "doc-extremismus-schule",
        "title": "Umgang mit Extremismus an Schule – Beratungs- und Präventionsangebote",
        "shortTitle": "Umgang mit Extremismus",
        "legalBasis": "TMBWK-Informationsschreiben 2026",
        "category": "sicherheit",
        "currentVersion": "Stand 2026",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Ansprechpartner, kostenfreie Beratungsstellen und Handlungsmöglichkeiten bei extremistischen Vorfällen an Schulen in Thüringen.",
        "tags": ["Extremismus", "Prävention", "Beratung", "Demokratie", "Vorfall"],
        "mode": "structured",
        "skipToc": False,
    },

    # --- 3. SCHULRECHTLICHE HANDREICHUNGEN & EMPFEHLUNGEN ---
    {
        "source": ORIGINALS_DIR / "2024-06-21_ThuerSchulO_Das_ist_neu.pdf",
        "id": "doc-thuerschulo-neu-2024",
        "title": "Die Thüringer Schulordnungen: Das ist neu (Handreichung TMBJS)",
        "shortTitle": "ThürSchulO – Das ist neu",
        "legalBasis": "Verordnung zur Vereinheitlichung der Organisation und Unterrichtsgestaltung in Sek I & II (21.06.2024)",
        "category": "schulrecht",
        "currentVersion": "Stand 21. Juni 2024",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Erläuterung der Neuerungen in der Thüringer Schulordnung für Sekundarstufe I und II (Leistungsnachweise, Versetzung, Abschlüsse).",
        "tags": ["ThürSchulO", "Änderungen", "Sekundarstufe I", "Leistungsnachweise", "Schulordnung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "FAQ_AEnderungen_Thueringer_Schulordnungen.pdf",
        "id": "doc-faq-thuerschulo",
        "title": "FAQ zu den Änderungen der Thüringer Schulordnungen",
        "shortTitle": "FAQ ThürSchulO-Änderungen",
        "legalBasis": "TMBWK FAQ · Stand 15. September 2025",
        "category": "schulrecht",
        "currentVersion": "Stand 15. September 2025",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Häufig gestellte Praxisfragen zu den geänderten Regelungen der Thüringer Schulordnung (Stand Sept. 2025).",
        "tags": ["FAQ", "ThürSchulO", "Änderungen", "Leistungsbewertung", "Klassenarbeiten", "Versetzung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Fachliche_Empfehlung_Leistungsbewertung_Primar_und_Sek_I.pdf",
        "id": "doc-leistungsbewertung",
        "title": "Fachliche Empfehlung zur Leistungsbewertung (Primarstufe & Sekundarstufe I)",
        "shortTitle": "Empfehlung Leistungsbewertung",
        "legalBasis": "Fachliche Empfehlung TMBWK · Stand: Juni 2026",
        "category": "schulrecht",
        "currentVersion": "Stand Juni 2026 (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Maßstäbe für Leistungsnachweise, täglichen Unterrichtsbeitrag, Gewichtung, Bewertung bei Täuschung/Versäumnis und pädagogischen Ermessensspielraum.",
        "tags": ["Leistungsbewertung", "Noten", "Klassenarbeiten", "Sekundarstufe I", "Täuschung", "Bewertung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2022-03-11_Handreichung_Nachteilsausgleich.pdf",
        "id": "doc-nachteilsausgleich-lrs",
        "title": "Nachteilsausgleich: Vorbeugen – Erkennen – Anwenden (Handreichung TMBJS)",
        "shortTitle": "Handreichung Nachteilsausgleich",
        "legalBasis": "Handreichung für allgemein bildende Schulen in Thüringen (März 2022)",
        "category": "schulrecht",
        "currentVersion": "Fassung März 2022 (Volltext, 42 Seiten)",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Umfassende Praxishilfe zu Nachteilsausgleich (ohne Zeugnisvermerk) und Notenschutz (mit Vermerk) bei LRS, Dyskalkulie, Autismus und chronischen Erkrankungen.",
        "tags": ["Nachteilsausgleich", "Notenschutz", "LRS", "Legasthenie", "Zeitzugabe", "Zeugnisvermerk"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2022_Handreichung_Gemeinsamer_Unterricht.pdf",
        "id": "doc-gemeinsamer-unterricht",
        "title": "Handreichung für den Gemeinsamen Unterricht (Inklusion)",
        "shortTitle": "Handreichung Gemeinsamer Unterricht",
        "legalBasis": "Handreichung TMBJS · Stand: März 2022 (85 Seiten)",
        "category": "schulrecht",
        "currentVersion": "Stand März 2022 (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/inklusion",
        "description": "Verfahren zum sonderpädagogischen Förderbedarf, Förderpläne, zieldifferentes vs. zielgleiches Lernen, MSD und Teamarbeit im Gemeinsamen Unterricht.",
        "tags": ["Gemeinsamer Unterricht", "Inklusion", "Förderplan", "Förderbedarf", "MSD", "zieldifferent"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Leitlinien_Foerderbedarf_emotionale_soziale_Entwicklung_3_Auflage_WEB.pdf",
        "id": "doc-leitlinien-ese",
        "title": "Leitlinien für die Beschulung bei Förderbedarf emotional-soziale Entwicklung",
        "shortTitle": "Leitlinien Förderbedarf ESE",
        "legalBasis": "TMBJS Leitlinien, 3. Auflage",
        "category": "schulrecht",
        "currentVersion": "3. Auflage (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/inklusion",
        "description": "Pädagogische Konzepte, Förderplanung, Krisenintervention und Kooperation bei Schülerinnen und Schülern mit Förderbedarf ESE.",
        "tags": ["Förderbedarf", "ESE", "emotionale Entwicklung", "Verhalten", "Inklusion"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Fachliche_Empfehlung_Umgang_mit_Schuldistanz.pdf",
        "id": "doc-schuldistanz",
        "title": "Fachliche Empfehlung zum Umgang mit Schuldistanz in Thüringen",
        "shortTitle": "Empfehlung Schuldistanz",
        "legalBasis": "TMBJS / BildungTH.de Fachliche Empfehlung",
        "category": "schulrecht",
        "currentVersion": "Aktuelle Fassung (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Erscheinungsformen, Stufenplan bei unentschuldigtem Fehlen, Elterngespräche, Schulamt, Bußgeld- und Zuführungsverfahren.",
        "tags": ["Schuldistanz", "Schulverweigerung", "Schulpflicht", "Fehlzeiten", "Schulzwang"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Fachliche_Empfehlung_zum_Klinik-und_Hausunterricht.pdf",
        "id": "doc-klinik-hausunterricht",
        "title": "Fachliche Empfehlung Klinik- und Hausunterricht in Thüringen",
        "shortTitle": "Klinik- & Hausunterricht",
        "legalBasis": "TMBJS / BildungTH.de Fachliche Empfehlung",
        "category": "schulrecht",
        "currentVersion": "Aktuelle Fassung (Volltext)",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Voraussetzungen, Antragsverfahren, Stundenumfang und Zusammenarbeit zwischen Stammschule und Klinikschule bei längerer Erkrankung.",
        "tags": ["Klinikunterricht", "Hausunterricht", "Krankheit", "Unterrichtsversorgung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Handreichung_Auswahlkriterien_Sekundarstufe.pdf",
        "id": "doc-auswahlkriterien-sek",
        "title": "Handreichung Aufnahmeverfahren & Auswahlkriterien Sekundarstufe (§ 15a ThürSchulG)",
        "shortTitle": "Auswahlkriterien Sekundarstufe",
        "legalBasis": "TMBWK Handreichung zu § 15a ThürSchulG · Stand: 6. August 2026",
        "category": "organisation",
        "currentVersion": "Stand 6. August 2026",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Rechtssicheres Aufnahmeverfahren bei Anmeldeüberhang nach § 15a ThürSchulG (Härtefälle, Geschwisterkinder, Schulweg, Losverfahren).",
        "tags": ["Aufnahmeverfahren", "§ 15a", "Anmeldeüberhang", "Auswahlkriterien", "Schulanmeldung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2024_Fachliche_Empfehlungen_Schulsozialarbeit.pdf",
        "id": "doc-schulsozialarbeit",
        "title": "Fachliche Empfehlungen Schulsozialarbeit",
        "shortTitle": "Empfehlungen Schulsozialarbeit",
        "legalBasis": "TMBJS Fachliche Empfehlungen 2024",
        "category": "organisation",
        "currentVersion": "Fassung 2024",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulsozialarbeit",
        "description": "Aufgaben, Schweigepflicht, Kooperation zwischen Lehrkräften, Schulleitung und Schulsozialarbeit.",
        "tags": ["Schulsozialarbeit", "Kooperation", "Schweigepflicht", "Beratung"],
        "mode": "structured",
        "skipToc": True,
    },

    # --- 4. SCHULKONTEN, HAUSHALT, AMTSBLÄTTER & DIGITALES ---
    {
        "source": ORIGINALS_DIR / "2024-08-09_Leitfaden_Schulkonten_in_Thueringen.pdf",
        "id": "doc-leitfaden-schulkonten",
        "title": "Schulkonten im Freistaat Thüringen – Leitfaden für Kontoführende",
        "shortTitle": "Leitfaden Schulkonten",
        "legalBasis": "TMBJS Leitfaden zur VV Schulkonten · Stand: August 2024",
        "category": "organisation",
        "currentVersion": "Stand August 2024",
        "officialUrl": "https://bildung.thueringen.de/schule/organisation/schulkonten",
        "description": "Praxisleitfaden für Schulkonten (§ 40b Abs. 1a ThürSchulG): Kontoeröffnung, Buchführung, Klassenkassen, Spenden, Klassenfahrten & Prüfung.",
        "tags": ["Schulkonten", "Klassenkasse", "Geld", "Klassenfahrt", "Spenden", "Konto"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2024-08-16_Fragenkatalog_VV_Schulkonten.pdf",
        "id": "doc-faq-schulkonten",
        "title": "Fragenkatalog zur VV Schulkonten",
        "shortTitle": "FAQ VV Schulkonten",
        "legalBasis": "TMBJS Fragenkatalog · Stand: 16. August 2024",
        "category": "organisation",
        "currentVersion": "Stand 16. August 2024",
        "officialUrl": "https://bildung.thueringen.de/schule/organisation/schulkonten",
        "description": "Antworten zu Schulkonto, Klassenkassen, Förderverein, Bargeldkassen und Zeichnungsberechtigung.",
        "tags": ["Schulkonten", "FAQ", "Klassenkasse", "Förderverein"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Amtsblatt_12_2023.pdf",
        "id": "doc-amtsblatt-12-2023",
        "title": "Amtsblatt TMBJS Nr. 12/2023 (inkl. VV Schulkonten)",
        "shortTitle": "Amtsblatt 12/2023",
        "legalBasis": "Amtsblatt des TMBJS, 33. Jg., Nr. 12/2023 vom 15.12.2023",
        "category": "organisation",
        "currentVersion": "Ausgabe 12/2023",
        "officialUrl": "https://bildung.thueringen.de/ministerium/amtsblatt",
        "description": "Amtliche Bekanntmachungen inkl. Verwaltungsvorschrift über das Einrichten und Führen von Schulkonten (VV Schulkonten).",
        "tags": ["Amtsblatt", "VV Schulkonten", "Bekanntmachung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Amtsblatt_03_2024.pdf",
        "id": "doc-amtsblatt-03-2024",
        "title": "Amtsblatt TMBJS Nr. 03/2024 (inkl. Lernmittelbeschaffung)",
        "shortTitle": "Amtsblatt 03/2024",
        "legalBasis": "Amtsblatt des TMBJS, 34. Jg., Nr. 03/2024 vom 25.03.2024",
        "category": "organisation",
        "currentVersion": "Ausgabe 03/2024",
        "officialUrl": "https://bildung.thueringen.de/ministerium/amtsblatt",
        "description": "Durchführungsbestimmungen zur Lernmittelbeschaffung, Schulbuchzulassung und weitere Bekanntmachungen des Ministeriums.",
        "tags": ["Amtsblatt", "Lernmittel", "Schulbücher", "Bekanntmachung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Handlungsleitfaden_Umgang_mit_generativen_KI-Modellen.pdf",
        "id": "doc-ki-leitfaden",
        "title": "Umgang mit generativen KI-Modellen – Handlungsleitfaden Thüringen",
        "shortTitle": "KI-Leitfaden Thüringen",
        "legalBasis": "TMBJS Handlungsleitfaden · Stand: April 2023",
        "category": "datenschutz",
        "currentVersion": "Stand April 2023",
        "officialUrl": "https://bildung.thueringen.de/schule/digitalisierung",
        "description": "Rechtlicher & pädagogischer Rahmen zum Einsatz generativer KI (ChatGPT etc.), Datenschutz, Urheberrecht und Leistungsbewertung.",
        "tags": ["KI", "Künstliche Intelligenz", "ChatGPT", "Datenschutz", "Täuschung", "Leistungsbewertung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Individualisierung_von_Lernprozessen_durch_den_Einsatz_digitaler_Endgeraete.pdf",
        "id": "doc-digitale-endgeraete",
        "title": "Einsatz digitaler Endgeräte mit privater Mitnutzung an Schulen",
        "shortTitle": "Digitale Endgeräte (iPads)",
        "legalBasis": "TMBJS Empfehlungen zur Implementierung digitaler Endgeräte",
        "category": "datenschutz",
        "currentVersion": "Aktuelle Empfehlung",
        "officialUrl": "https://bildung.thueringen.de/schule/digitalisierung",
        "description": "Hinweise zu Schülertablets, Elternvereinbarungen, MDM, Datenschutz und schulischer Nutzung digitaler Endgeräte.",
        "tags": ["iPad", "Endgeräte", "Tablets", "Digitalisierung", "Elternvereinbarung", "Datenschutz"],
        "mode": "structured",
        "skipToc": True,
    },

    # --- 5. FAHRTEN, GEFAHRSTOFFE & WEITERE RICHTLINIEN ---
    {
        "source": ORIGINALS_DIR / "praesentation_zur_verwaltungsvorschrift_wandertage_klassenfahrten.pdf",
        "id": "doc-praes-klassenfahrten",
        "title": "Erläuterungen zur VV Wandertage und Klassenfahrten (TMBJS-Präsentation)",
        "shortTitle": "Praxis-Folien Klassenfahrten",
        "legalBasis": "Informationsveranstaltung TMBJS für staatliche Schulen",
        "category": "fahrten",
        "currentVersion": "Begleitfolien TMBJS",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Praxiserläuterungen zu Planung, Kostenobergrenzen, Beurlaubung, Begleitpersonen und Reisekostenabrechnung.",
        "tags": ["Klassenfahrten", "Wandertage", "Begleitpersonen", "Kosten"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "2022-12-19_FAQ_Sportlager.pdf",
        "id": "doc-faq-sportlager",
        "title": "FAQ Sportlager an Thüringer Schulen",
        "shortTitle": "FAQ Sportlager",
        "legalBasis": "TMBJS FAQ · Stand: 19. Dezember 2022",
        "category": "fahrten",
        "currentVersion": "Stand 19.12.2022",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Definition, Genehmigung, Aufsicht und Qualifikationsanforderungen für schulische Sportlager (z. B. Skilager).",
        "tags": ["Sportlager", "Skilager", "Klassenfahrt", "Aufsicht"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "2023-07-01_FAQ_Internationale_Schuelerbegegnungen.pdf",
        "id": "doc-faq-begegnungen",
        "title": "FAQ Internationale Schülerbegegnungen & Schulpartnerschaften",
        "shortTitle": "FAQ Schülerbegegnungen",
        "legalBasis": "TMBJS Hinweise und Antworten · Stand: 01.07.2023",
        "category": "fahrten",
        "currentVersion": "Stand 01.07.2023",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Antworten zur Organisation, Finanzierung, Gastfamilien und Genehmigung internationaler Begegnungen.",
        "tags": ["Schüleraustausch", "Ausland", "Partnerschaft", "FAQ"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "2022-11-24_Formular_Klassenfahrt_Elternerklarung_Vollmacht.docx",
        "id": "doc-formular-klassenfahrt",
        "title": "Musterformular Klassenfahrt: Elterliche Einwilligung, Gesundheit & Vollmacht",
        "shortTitle": "Formular Klassenfahrt (Vollmacht)",
        "legalBasis": "Amtliches TMBJS-Musterformular (Stand 24.11.2022)",
        "category": "fahrten",
        "currentVersion": "Muster 24.11.2022",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Verbindliche Abfragen zu Allergien, Medikamenten, Schwimmfähigkeit, ärztlicher Behandlung und Notfallkontakten vor Schulfahrten.",
        "tags": ["Formular", "Klassenfahrt", "Einwilligung", "Schwimmerlaubnis", "Vollmacht", "Medikamente"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Fachliche_Empfehlung_Gefahrstoffe.pdf",
        "id": "doc-gefahrstoffe",
        "title": "Fachliche Empfehlung: Schutz vor gefährlichen Stoffen (GefStoffV)",
        "shortTitle": "Empfehlung Gefahrstoffe",
        "legalBasis": "TMBJS Fachliche Empfehlung zur GefStoffV im Unterricht",
        "category": "sicherheit",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Einhaltung der Gefahrstoffverordnung im naturwissenschaftlichen Unterricht, Tätigkeitsbeschränkungen, Kataster und Lagerung.",
        "tags": ["Gefahrstoffe", "GefStoffV", "Chemie", "Sicherheit", "Kataster"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "2024-07-30_Umgang_mit_geschlechtlicher_Vielfalt-Leitfaden_fuer_Schulen_in_Thueringen.pdf",
        "id": "doc-geschlechtliche-vielfalt",
        "title": "Umgang mit geschlechtlicher Vielfalt – Leitfaden für Thüringer Schulen",
        "shortTitle": "Leitfaden Geschlechtliche Vielfalt",
        "legalBasis": "TMBJS Leitfaden · Juli 2024",
        "category": "schulrecht",
        "currentVersion": "Juli 2024",
        "officialUrl": "https://bildung.thueringen.de/schule/schulwesen/schulrecht",
        "description": "Rechtliche und pädagogische Orientierung zu Namensänderung, Zeugnissen, Sportunterricht, Umkleiden und Antidiskriminierung.",
        "tags": ["Vielfalt", "Trans", "Zeugnis", "Name", "Diskriminierung", "Sport"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Jenaer_Erklaerung_gegen_Rassismus_und_ihre_Anwendung_im_Unterricht.pdf",
        "id": "doc-jenaer-erklaerung",
        "title": "Die „Jenaer Erklärung gegen Rassismus“ und ihre Anwendung im Unterricht",
        "shortTitle": "Jenaer Erklärung gegen Rassismus",
        "legalBasis": "BildungTH.de Handreichung",
        "category": "schulrecht",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Unterrichtsmaterial und Orientierung zur Antirassismus-Arbeit an Thüringer Schulen.",
        "tags": ["Rassismus", "Demokratie", "Jenaer Erklärung", "Toleranz"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Kompetenzentwicklung.pdf",
        "id": "doc-kompetenzentwicklung",
        "title": "Einschätzung zur Kompetenzentwicklung (TMBWK)",
        "shortTitle": "Kompetenzentwicklung TMBWK",
        "legalBasis": "Handreichung TMBWK zu Sozial-, Methoden- und Selbstkompetenz",
        "category": "schulrecht",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Kriterien zur Beobachtung und Bewertung überfachlicher Kompetenzen sowie Verhalten und Mitarbeit auf Zeugnissen.",
        "tags": ["Kompetenzentwicklung", "Verhalten", "Mitarbeit", "Zeugnis", "Beurteilung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Landesstrategie.pdf",
        "id": "doc-landesstrategie-bo",
        "title": "Landesstrategie zur praxisnahen Berufsorientierung in Thüringen",
        "shortTitle": "Landesstrategie Berufsorientierung",
        "legalBasis": "TMBWK Landesstrategie Berufsorientierung",
        "category": "organisation",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Praxisnahe Berufsorientierung an Regelschulen, Praktika, Potenzialanalyse und Kooperation mit Betrieben.",
        "tags": ["Berufsorientierung", "Praktikum", "Regelschule", "BO"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "Bewegungsangebote.pdf",
        "id": "doc-bewegungsangebote",
        "title": "Bewegungsangebote für Schüler und Lehrer im Schulalltag",
        "shortTitle": "Bewegungsangebote",
        "legalBasis": "TMBJS Handreichung",
        "category": "sicherheit",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Niederschwellige Bewegungs- und Gesundheitsangebote im Unterricht und in Pausen.",
        "tags": ["Bewegung", "Gesundheit", "Pause", "Sport"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Schule_international_WEB.pdf",
        "id": "doc-schule-international",
        "title": "Das Schulsystem in Thüringen (Schule international – mehrsprachig)",
        "shortTitle": "Schulsystem Thüringen (mehrsprachig)",
        "legalBasis": "TMBJS Informationsbroschüre",
        "category": "organisation",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Übersicht über das Thüringer Schulsystem, Abschlüsse und Übergänge in mehreren Sprachen für Elternarbeit und DaZ.",
        "tags": ["Schulsystem", "DaZ", "Elterninformation", "Mehrsprachig"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Vorkurs_Seiteneinsteiger_2025.pdf",
        "id": "doc-vorkurs-2025",
        "title": "Struktur & Inhaltsübersicht Vorkurs für Seiteneinsteiger (2025)",
        "shortTitle": "Vorkurs Seiteneinsteiger 2025",
        "legalBasis": "Kerngruppe Vorkurs TMBWK / ThILLM · Stand: 22. Mai 2025",
        "category": "ausbildung",
        "currentVersion": "Stand 22. Mai 2025",
        "officialUrl": "https://lehrerinthueringen.de/seiteneinstieg",
        "description": "Wochenstruktur und Themenübersicht der vorauslaufenden Qualifizierungsmaßnahme „Vorkurs“ für Seiteneinsteiger.",
        "tags": ["Seiteneinsteiger", "Vorkurs", "ThILLM", "Qualifizierung"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "Thueringer_Gemeinschaftsschule.pdf",
        "id": "doc-tgs-handreichung",
        "title": "Handreichung Aufbau einer Thüringer Gemeinschaftsschule (TGS)",
        "shortTitle": "Handreichung TGS",
        "legalBasis": "TMBJS Handreichung für Schulleitungen",
        "category": "organisation",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Konzeptionelle Grundlagen und Organisation einer Thüringer Gemeinschaftsschule (relevant für HBS-Konzeptentwicklung).",
        "tags": ["Gemeinschaftsschule", "TGS", "Schulentwicklung"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "gymnasiale_oberstufe.pdf",
        "id": "doc-gos-handreichung",
        "title": "Gymnasiale Oberstufe in Thüringen (Voraussetzungen & Übergänge)",
        "shortTitle": "Gymnasiale Oberstufe",
        "legalBasis": "TMBWK Broschüre · Stand: November 2026",
        "category": "schulrecht",
        "currentVersion": "Stand November 2026",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Übergangsvoraussetzungen nach dem Realschulabschluss in die gymnasiale Oberstufe, Kurssystem und Abitur.",
        "tags": ["Gymnasiale Oberstufe", "Übergang", "Realschulabschluss", "Abitur"],
        "mode": "structured",
        "skipToc": True,
    },
    {
        "source": ORIGINALS_DIR / "2020_06_01-Hinweise_Unfallverhuetung_Sicherheit_Grundschule.pdf",
        "id": "doc-unfall-primar",
        "title": "Hinweise Unfallverhütung & Sicherheit (Primarstufe)",
        "shortTitle": "Unfallverhütung Primarstufe",
        "legalBasis": "TMBJS Hinweise vom 01.06.2020",
        "category": "sicherheit",
        "currentVersion": "Stand 01.06.2020",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Unfallverhütungs- und Sicherheitsvorschriften für Grundschule und Primarstufe der TGS.",
        "tags": ["Unfallverhütung", "Sicherheit", "Primarstufe"],
        "mode": "structured",
        "skipToc": False,
    },
    {
        "source": ORIGINALS_DIR / "pubdownload1689.pdf",
        "id": "doc-kursplan-medienkunde-gs",
        "title": "Kursplan Medienkunde in der Grundschule",
        "shortTitle": "Kursplan Medienkunde GS",
        "legalBasis": "TMBJS Kursplan",
        "category": "organisation",
        "currentVersion": "Geltende Fassung",
        "officialUrl": "https://bildung.thueringen.de",
        "description": "Kompetenzen im Kursplan Medienkunde für die Klassenstufen 1–4 (Übergang in Klasse 5).",
        "tags": ["Medienkunde", "Kursplan", "Grundschule"],
        "mode": "structured",
        "skipToc": True,
    },

    # --- 6. SCHULINTERNE DOKUMENTE DER HEIMBÜRGESCHULE KAHLA (Original-PDFs) ---
    {
        "source": HBS_INTERN_DIR / "HBS_Schutzkonzept.pdf",
        "id": "doc-hbs-schutzkonzept",
        "title": "Schutzkonzept der Heimbürgeschule Kahla (Prävention Gewalt)",
        "shortTitle": "HBS Schutzkonzept",
        "legalBasis": "Schulinternes Schutzkonzept der Staatlichen Regelschule Heimbürgeschule Kahla",
        "category": "hbs_intern",
        "currentVersion": "Aktuelles Layout (14 Seiten)",
        "officialUrl": "#hbs-schutzkonzept",
        "description": "Schulinternes Konzept zur Prävention (sexualisierter) Gewalt gegen Kinder und Jugendliche, Ansprechpersonen, Verhaltenskodex und Meldewege.",
        "tags": ["Heimbürgeschule", "Schutzkonzept", "Kinderschutz", "Prävention", "Gewalt", "Verhaltenskodex"],
        "mode": "structured",
        "skipToc": True,
        "isInternal": True,
    },
    {
        "source": HBS_INTERN_DIR / "HBS_Konzeptpapier_TGS.pdf",
        "id": "doc-hbs-konzept-tgs",
        "title": "Konzeptpapier der Heimbürgeschule Kahla (TGS-Konzept)",
        "shortTitle": "HBS Konzeptpapier",
        "legalBasis": "Pädagogisches Konzept der Heimbürgeschule Kahla (40 Seiten)",
        "category": "hbs_intern",
        "currentVersion": "Finales Konzeptpapier",
        "officialUrl": "#hbs-konzeptpapier",
        "description": "Schulprogramm und pädagogisches Konzept der Heimbürgeschule Kahla (Leitbild, Lernkultur, Ganztag, Inklusion, Kooperationen).",
        "tags": ["Heimbürgeschule", "Konzeptpapier", "Schulprogramm", "TGS", "Leitbild"],
        "mode": "structured",
        "skipToc": True,
        "isInternal": True,
    },
    {
        "source": HBS_INTERN_DIR / "HBS_Projektarbeit_Hinweise_2026_27.pdf",
        "id": "doc-hbs-projektarbeit-hinweise",
        "title": "HBS Hinweise zur Erstellung einer Projektarbeit (Schuljahr 2026/27)",
        "shortTitle": "HBS Projektarbeit Hinweise",
        "legalBasis": "Schüler- und Lehrerinformationen Heimbürgeschule Kahla 2026/27",
        "category": "hbs_intern",
        "currentVersion": "Schuljahr 2026/27",
        "officialUrl": "#hbs-projektarbeit-hinweise",
        "description": "Verbindliche Vorgaben zu Umfang, Themenwahl, Zeitplan, Betreuung und Präsentation der Projektarbeit in Klasse 10 an der HBS.",
        "tags": ["Heimbürgeschule", "Projektarbeit", "Klasse 10", "Realschulabschluss", "Betreuung"],
        "mode": "structured",
        "skipToc": False,
        "isInternal": True,
    },
    {
        "source": HBS_INTERN_DIR / "HBS_Projektarbeit_Bewertungsrichtlinie_2026_27.pdf",
        "id": "doc-hbs-projektarbeit-bewertung",
        "title": "HBS Bewertungsrichtlinie Projektarbeit Klasse 10 (2026/27)",
        "shortTitle": "HBS Bewertung Projektarbeit",
        "legalBasis": "Bewertungsmaßstab Heimbürgeschule Kahla 2026/27",
        "category": "hbs_intern",
        "currentVersion": "Schuljahr 2026/27",
        "officialUrl": "#hbs-projektarbeit-bewertung",
        "description": "Bewertungskriterien und Punktetabelle für schriftliche Ausarbeitung, Prozess und Präsentation der Projektarbeit Klasse 10.",
        "tags": ["Heimbürgeschule", "Projektarbeit", "Bewertung", "Klasse 10", "Punkte"],
        "mode": "structured",
        "skipToc": False,
        "isInternal": True,
    },
    {
        "source": HBS_INTERN_DIR / "HBS_Elterninfo_Verhalten_Mitarbeit.pdf",
        "id": "doc-hbs-elterninfo-verhalten",
        "title": "HBS Elterninformation: Einschätzung von Verhalten und Mitarbeit",
        "shortTitle": "HBS Verhalten & Mitarbeit",
        "legalBasis": "Schulinterne Elterninformation Heimbürgeschule Kahla",
        "category": "hbs_intern",
        "currentVersion": "Aktuelle Fassung",
        "officialUrl": "#hbs-verhalten-mitarbeit",
        "description": "Kriterien und Rückmeldesystem zur Einschätzung von Verhalten und Mitarbeit auf den Zeugnissen der HBS.",
        "tags": ["Heimbürgeschule", "Verhalten", "Mitarbeit", "Zeugnis", "Elterninformation"],
        "mode": "structured",
        "skipToc": False,
        "isInternal": True,
    },

    # --- 7. ERGÄNZENDE KURATIERTE RECHTSQUELLEN (wofür noch kein PDF vorliegt) ---
    {
        "source": LAWS_DIR / "05-risu-ukt.txt",
        "id": "doc-ukt-degintu",
        "title": "Unfallkasse Thüringen (UKT Vorschrift 81) & DEGINTU-Praxis",
        "shortTitle": "UKT / DEGINTU",
        "legalBasis": "UKT Vorschrift 81, DGUV Regel 113-018 & DEGINTU-Verpflichtung Thüringen",
        "category": "sicherheit",
        "currentVersion": "Geltende Fassung",
        "officialUrl": "https://www.ukt.de/praevention/schulen-und-kindertageseinrichtungen/arbeitsschutz-in-der-schule",
        "description": "Thüringer Spezifika zu DEGINTU-Kataster, Schutzbrillenpflicht, Verbandbuch (5 Jahre Aufbewahrung) und 3-Tage-Unfallmeldung an die UKT.",
        "tags": ["UKT", "DEGINTU", "Unfallmeldung", "Verbandbuch", "Schutzbrille", "Gefahrstoffe"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "06-laa-vorbereitungsdienst.txt",
        "id": "doc-laa-thueringen",
        "title": "Ausbildungs- und Prüfungsverordnung Lehramtsanwärter (ThürAZStPLVO)",
        "shortTitle": "ThürAZStPLVO (LAA)",
        "legalBasis": "ThürAZStPLVO i. V. m. Thüringer Lehrerbildungsgesetz (ThürLbG)",
        "category": "ausbildung",
        "currentVersion": "Konsolidierte Fassung",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbStPrVTHpP10",
        "deepLinkBase": "https://landesrecht.thueringen.de/bsth/document/jlr-LehrAusbStPrVTHpP",
        "description": "Bestimmungen über Vorbereitungsdienst, Stundenzahl, Fachmentoren und Prüfungslehrproben an Regelschulen.",
        "tags": ["LAA", "Referendariat", "Vorbereitungsdienst", "Mentor", "Lehrprobe"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "07-seiteneinsteiger.txt",
        "id": "doc-seiteneinsteiger",
        "title": "Pädagogische Einführung & Nachqualifizierung für Seiteneinsteiger",
        "shortTitle": "Seiteneinsteiger-Richtlinie",
        "legalBasis": "Erlass des TMBJS & Qualifizierungskonzept ThILLM",
        "category": "ausbildung",
        "currentVersion": "Geltende Richtlinie TMBJS/ThILLM",
        "officialUrl": "https://lehrerinthueringen.de/seiteneinstieg",
        "description": "Vorgaben für den 3-monatigen Vorkurs am ThILLM, schulisches Mentoring und berufsbegleitende Nachqualifizierung.",
        "tags": ["Seiteneinsteiger", "ThILLM", "Nachqualifizierung", "Vorkurs", "Mentor"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "08-duales-studium.txt",
        "id": "doc-duales-studium",
        "title": "Duales Lehramtsstudium Regelschule (Uni Erfurt & TMBJS)",
        "shortTitle": "Duales Studium TMBJS",
        "legalBasis": "Rahmenvereinbarung Universität Erfurt & TMBJS",
        "category": "ausbildung",
        "currentVersion": "Studienjahrgang 2024/2026",
        "officialUrl": "https://lehrerinthueringen.de/duales-studium",
        "description": "Praxistage (Mo & Fr), Vergütung, schulische Aufgaben und Verkürzung des Vorbereitungsdienstes.",
        "tags": ["Duales Studium", "Uni Erfurt", "Praxistage", "Montag und Freitag", "Regelschule"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "09-thuerlehrazvo.txt",
        "id": "doc-thuerlehrazvo",
        "title": "Thüringer Lehrerarbeitszeitverordnung (ThürLehrAzVO)",
        "shortTitle": "ThürLehrAzVO",
        "legalBasis": "ThürLehrAzVO (GVBl. 2006 S. 466, konsolidiert)",
        "category": "dienstrecht",
        "currentVersion": "Geltende Fassung",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-LehrArbZVO2006THpP4",
        "deepLinkBase": "https://landesrecht.thueringen.de/bsth/document/jlr-LehrArbZVO2006THpP",
        "description": "Pflichtstunden (26 Pflichtstunden an Regelschulen), Altersermäßigung ab 55/60 und Regelungen zur Mehrarbeit.",
        "tags": ["Lehrerarbeitszeit", "Pflichtstunden", "26 Pflichtstunden", "Altersermäßigung", "Mehrarbeit"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "10-thuerpersvg.txt",
        "id": "doc-thuerpersvg",
        "title": "Thüringer Personalvertretungsgesetz & Mitbestimmung (ThürPersVG)",
        "shortTitle": "ThürPersVG",
        "legalBasis": "ThürPersVG (GVBl. 2019 S. 31, konsolidiert)",
        "category": "dienstrecht",
        "currentVersion": "Fassung 2019",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-PersVGTH2019pP68",
        "deepLinkBase": "https://landesrecht.thueringen.de/bsth/document/jlr-PersVGTH2019pP",
        "description": "Zwingende Mitbestimmung des Personalrats (ÖPR) bei Arbeitszeit, Pausenaufsichten und Gesundheitsschutz.",
        "tags": ["Personalrat", "ÖPR", "Mitbestimmung", "Pausenaufsicht", "Arbeitszeit"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "11-datenschutz-schulen.txt",
        "id": "doc-datenschutz",
        "title": "Datenschutz an Schulen (ThürDSG, DSGVO & TMBJS Handreichung)",
        "shortTitle": "Datenschutz Thüringen",
        "legalBasis": "Art. 6/32 DSGVO, ThürDSG & Handreichung Datenschutz an Thüringer Schulen",
        "category": "datenschutz",
        "currentVersion": "Handreichung TMBJS",
        "officialUrl": "https://bildung.thueringen.de/schule/digitalisierung/datenschutz",
        "description": "Regeln für Dienst-iPads, Schülerdaten, Cloud-Verbot für Noten und Fotoeinwilligungen ab 14 Jahren.",
        "tags": ["Datenschutz", "DSGVO", "ThürDSG", "Dienst-iPad", "Fotos", "Einwilligung"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "12-hbs-hausordnung.txt",
        "id": "doc-hbs-intern",
        "title": "Hausordnung & Spezifika der Heimbürgeschule Kahla",
        "shortTitle": "HBS Hausordnung",
        "legalBasis": "Beschluss der Schulkonferenz Staatliche Regelschule Heimbürgeschule Kahla",
        "category": "hbs_intern",
        "currentVersion": "Beschlussfassung 2024/2026",
        "officialUrl": "#hbs-hausordnung",
        "description": "Schulinterne Hausordnung: Handy-Ranzen-Regel, Aufsichtszonen 1–4, Regenpause, Krisenteam & Sportplatz.",
        "tags": ["Heimbürgeschule", "Hausordnung", "Handyordnung", "Ranzen-Regel", "Pausenaufsicht"],
        "mode": "txt_sections",
        "isInternal": True,
    },
    {
        "source": LAWS_DIR / "16-medikamentengabe-schulen.txt",
        "id": "doc-medikamente-schulen",
        "title": "Medikamentengabe & Unterstützung chronisch kranker Schüler",
        "shortTitle": "Medikamentengabe TMBJS/UKT",
        "legalBasis": "Gemeinsame Handreichung von TMBJS und Unfallkasse Thüringen (UKT)",
        "category": "sicherheit",
        "currentVersion": "Handreichung UKT / TMBJS",
        "officialUrl": "https://www.ukt.de/praevention/schulen-und-kindertageseinrichtungen/gesundheitsschutz",
        "description": "Freiwilligkeit regelmäßiger Medikamentengabe, schriftliche Elternvereinbarung und Notfallmedikation (Adrenalin-Pen/Asthma).",
        "tags": ["Medikamentengabe", "Chronische Erkrankungen", "Notfallmedikation", "UKT"],
        "mode": "txt_sections",
    },
    {
        "source": LAWS_DIR / "17-korruptionspraevention-geschenke.txt",
        "id": "doc-geschenke-korruption",
        "title": "Annahme von Belohnungen, Geschenken & Korruptionsprävention (ThürBG)",
        "shortTitle": "Geschenke-Richtlinie ThürBG",
        "legalBasis": "§ 42 BeamtStG, Thüringer Beamtengesetz (ThürBG) & VV Korruptionsprävention",
        "category": "dienstrecht",
        "currentVersion": "Geltende Fassung",
        "officialUrl": "https://landesrecht.thueringen.de/bsth/document/jlr-BeamtGTH2014pP42",
        "description": "Verbot von Einzelgeschenken, Ausnahmen für symbolische Gemeinschaftsgeschenke bis max. 25 Euro, Nachhilfeverbot.",
        "tags": ["Geschenke", "Belohnungen", "Korruptionsprävention", "ThürBG", "BeamtStG"],
        "mode": "txt_sections",
    },
]


def clean_pdf_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    # Silbentrennung am Zeilenende behutsam zusammenführen (nur Kleinbuchstabe-Bindestrich-Zeilenumbruch-Kleinbuchstabe)
    text = re.sub(r"([a-zäöüß])-\n([a-zäöüß])", r"\1\2", text)
    # Mehrfache Leerzeichen reduzieren
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text


def is_toc_line(line: str) -> bool:
    s = line.strip()
    # Typische Inhaltsverzeichnis-Zeile: "§ 51 Ordnungsmaßnahmen ........... 25" oder "1. Zielsetzung ...... 3"
    if re.search(r"\.{4,}\s*\d+\s*$", s):
        return True
    if re.search(r"\s{3,}\d+\s*$", s) and len(s) < 120 and ("§" in s or re.match(r"^\d+(\.\d+)*\s", s)):
        return True
    return False


def extract_pdf_pages(pdf_path: Path) -> list[tuple[int, str]]:
    reader = pypdf.PdfReader(str(pdf_path))
    pages = []
    for idx, page in enumerate(reader.pages):
        raw = clean_pdf_text(page.extract_text() or "")
        # Inhaltsverzeichnis-Zeilen und typische Kopf-/Fußzeilen herausfiltern
        kept_lines = []
        for line in raw.split("\n"):
            stripped = line.strip()
            if not stripped:
                kept_lines.append("")
                continue
            if is_toc_line(stripped):
                continue
            if re.match(r"^(www\.BildungTH\.de|www\.tmbjs\.de|www\.tmbwk\.de|-\s*Seite\s+\d+\s+von\s+\d+\s*-)$", stripped, re.I):
                continue
            if re.match(r"^\d{1,3}$", stripped):
                continue
            kept_lines.append(stripped)
        cleaned = re.sub(r"\n{3,}", "\n\n", "\n".join(kept_lines)).strip()
        if len(cleaned) >= 15:
            pages.append((idx + 1, cleaned))
    return pages


def extract_docx_pages(docx_path: Path) -> list[tuple[int, str]]:
    with zipfile.ZipFile(str(docx_path)) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    paras = []
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    for p in root.findall(".//w:p", ns):
        t = "".join(p.itertext()).strip()
        if t:
            paras.append(t)
    return [(1, "\n".join(paras))]


def make_summary(text: str) -> str:
    flat = re.sub(r"\s+", " ", text).strip()
    sentences = re.split(r"(?<=[.!?])\s+", flat)
    summary = " ".join(sentences[:2]).strip()
    if len(summary) > 260:
        summary = summary[:257].rsplit(" ", 1)[0] + "..."
    return summary or flat[:240]


def make_takeaways(paragraph: str, text: str, current_version: str) -> list[str]:
    flat = re.sub(r"\s+", " ", text).strip()
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", flat) if len(s.strip()) > 25]
    t1 = f"Fundstelle: {paragraph} ({current_version})."
    t2 = sentences[0][:160] + ("..." if len(sentences[0]) > 160 else "") if sentences else flat[:140]
    return [t1, t2]


def resolve_anchor_url(spec: dict, para_label: str) -> str:
    base = spec.get("deepLinkBase")
    if base:
        m = re.search(r"§\s*(\d+\s*[a-z]?)", para_label, re.I)
        if m:
            num = re.sub(r"\s+", "", m.group(1))
            return f"{base}{num}"
    return spec["officialUrl"]


def split_long_section(text: str, max_chars: int = 2000, overlap: int = 180) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    parts = []
    paragraphs = [p.strip() for p in re.split(r"\n{1,}", text) if p.strip()]
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 1 <= max_chars:
            current = f"{current}\n{p}".strip() if current else p
        else:
            if current:
                parts.append(current)
            if len(p) > max_chars:
                # Harte Teilung langer Einzelabsätze an Satzgrenzen
                start = 0
                while start < len(p):
                    end = min(len(p), start + max_chars)
                    if end < len(p):
                        cut = p.rfind(". ", start, end)
                        if cut > start + max_chars // 2:
                            end = cut + 1
                    parts.append(p[start:end].strip())
                    if end >= len(p):
                        break
                    start = max(0, end - overlap)
                current = ""
            else:
                current = p
    if current:
        parts.append(current)
    return parts


def chunk_law_pages(spec: dict, pages: list[tuple[int, str]]) -> list[dict]:
    """Paragraphengenaue Zerlegung für Gesetze/Verordnungen mit echter §-Struktur."""
    # Zeilenweise mit Seitenzuordnung sammeln
    line_records = []
    for page_num, page_text in pages:
        for line in page_text.split("\n"):
            line_records.append((page_num, line))

    para_header_re = re.compile(r"^§\s*(\d+(?:\s*[a-z])?)\b(.*)$")
    sections = []
    current = None

    for idx_line, (page_num, line) in enumerate(line_records):
        s = line.strip()
        m = para_header_re.match(s)
        is_heading = False
        if m and len(s) <= 130:
            rest = m.group(2).strip()
            next_line = line_records[idx_line + 1][1].strip() if idx_line + 1 < len(line_records) else ""
            # Echte §-Überschrift: entweder "§ X Titel..." mit Großbuchstabe am Anfang des Titels,
            # oder "§ X" allein gefolgt von "(1)" oder Titelzeile (nicht "Abs. 1 Satz 2,"!)
            if rest:
                starts_clean_title = bool(re.match(r"^[A-ZÄÖÜ„\"(]", rest))
                not_clause_ref = not re.match(
                    r"^(Abs\.|Absatz|Satz|Nr\.|Nummer|Halbsatz|Buchst\.|i\.|und\b|oder\b|des\b|der\b|die\b|das\b|dieser|Thür)",
                    rest,
                    re.I,
                )
                not_trailing_comma = not rest.endswith(",") and not next_line.startswith(("Abs.", "Satz", "Nr."))
                if starts_clean_title and not_clause_ref and not_trailing_comma:
                    is_heading = True
            else:
                if not re.match(r"^(Abs\.|Satz|Nr\.|und\b|oder\b|,)", next_line, re.I):
                    is_heading = True

        if is_heading:
            if current and len("\n".join(current["lines"]).strip()) >= 30:
                sections.append(current)
            p_num = re.sub(r"\s+", "", m.group(1))
            title_part = m.group(2).strip(" –—-:")
            current = {
                "paraNum": p_num,
                "label": f"§ {p_num}",
                "title": title_part,
                "pageStart": page_num,
                "pageEnd": page_num,
                "lines": [],
            }
        elif current is not None:
            current["pageEnd"] = page_num
            current["lines"].append(s)

    if current and len("\n".join(current["lines"]).strip()) >= 30:
        sections.append(current)

    chunks = []
    for sec in sections:
        body = "\n".join(sec["lines"]).strip()
        # Wenn Titel noch leer war, erste Zeile nehmen
        title = sec["title"]
        if not title and body:
            first_line = body.split("\n")[0].strip()
            if len(first_line) < 95:
                title = first_line

        parts = split_long_section(body, max_chars=2100)
        for idx, part in enumerate(parts):
            suffix = f" (Teil {idx + 1}/{len(parts)})" if len(parts) > 1 else ""
            para_full = f"{sec['label']} {spec['shortTitle']}{suffix}"
            page_label = f"S. {sec['pageStart']}" if sec["pageStart"] == sec["pageEnd"] else f"S. {sec['pageStart']}–{sec['pageEnd']}"
            chunks.append({
                "docId": spec["id"],
                "docShortTitle": spec["shortTitle"],
                "category": spec["category"],
                "paragraph": para_full,
                "sectionTitle": title or f"Regelung zu {sec['label']}",
                "text": part,
                "summary": make_summary(part),
                "keyTakeaways": make_takeaways(para_full, part, spec["currentVersion"]),
                "officialAnchorUrl": resolve_anchor_url(spec, sec["label"]),
                "pageStart": sec["pageStart"],
                "pageEnd": sec["pageEnd"],
                "pageLabel": page_label,
                "tags": list(dict.fromkeys([spec["shortTitle"], spec["category"], sec["label"], *spec["tags"]])),
            })
    return chunks


def chunk_structured_pages(spec: dict, pages: list[tuple[int, str]]) -> list[dict]:
    """Abschnitts- und seitenbasierte Zerlegung mit exakten Seitenzahlen pro Chunk."""
    heading_re = re.compile(
        r"^((?:\d+(?:\.\d+){0,3}\.?|[IVX]+\.|[A-Z]\.|Anlage\s+\d+[a-z]?|Kapitel\s+\d+|Teil\s+[A-Z0-9]+|Abschnitt\s+[IVX\d]+)\s+[A-ZÄÖÜ][^\n]{3,95}|[A-ZÄÖÜ][A-ZÄÖÜ0-9\s\-–/()]{5,65})$"
    )

    chunks = []
    cur_heading = spec["shortTitle"]
    cur_items: list[tuple[int, str]] = []  # (page_num, line)

    def current_len() -> int:
        return sum(len(t) + 1 for _, t in cur_items)

    def flush():
        nonlocal cur_items
        if not cur_items:
            return
        txt = "\n".join(t for _, t in cur_items).strip()
        if len(txt) < 60:
            cur_items = []
            return

        # Falls Block > 1800 Zeichen: zeilenweise mit exakter Seitenzuordnung splitten
        sub_parts: list[tuple[int, int, str]] = []
        buf: list[tuple[int, str]] = []
        buf_len = 0
        for pg, ln in cur_items:
            if buf_len + len(ln) + 1 > 1800 and buf_len >= 600:
                sub_parts.append((buf[0][0], buf[-1][0], "\n".join(x[1] for x in buf).strip()))
                # kleine Überlappung (letzte 2 Zeilen)
                overlap_lines = buf[-2:] if len(buf) > 2 else []
                buf = [*overlap_lines, (pg, ln)]
                buf_len = sum(len(x[1]) + 1 for x in buf)
            else:
                buf.append((pg, ln))
                buf_len += len(ln) + 1
        if buf:
            t_last = "\n".join(x[1] for x in buf).strip()
            if len(t_last) >= 40:
                sub_parts.append((buf[0][0], buf[-1][0], t_last))

        short_h = cur_heading if len(cur_heading) <= 68 else cur_heading[:65].rsplit(" ", 1)[0] + "..."
        for idx, (ps, pe, part) in enumerate(sub_parts):
            page_label = f"S. {ps}" if ps == pe else f"S. {ps}–{pe}"
            suffix = f" ({idx + 1}/{len(sub_parts)})" if len(sub_parts) > 1 else ""
            para_label = f"{spec['shortTitle']} · {page_label}{suffix}"
            chunks.append({
                "docId": spec["id"],
                "docShortTitle": spec["shortTitle"],
                "category": spec["category"],
                "paragraph": para_label,
                "sectionTitle": short_h,
                "text": part,
                "summary": make_summary(part),
                "keyTakeaways": make_takeaways(f"{spec['shortTitle']} ({page_label})", part, spec["currentVersion"]),
                "officialAnchorUrl": spec["officialUrl"],
                "pageStart": ps,
                "pageEnd": pe,
                "pageLabel": page_label,
                "tags": list(dict.fromkeys([spec["shortTitle"], spec["category"], *spec["tags"]])),
            })
        cur_items = []

    for page_num, page_text in pages:
        for line in page_text.split("\n"):
            s = line.strip()
            if not s:
                if cur_items and cur_items[-1][1] != "":
                    cur_items.append((page_num, ""))
                continue
            m = heading_re.match(s)
            if m and current_len() >= 280 and not s.endswith((".", ",", ";")):
                flush()
                cur_heading = m.group(1).strip()
            cur_items.append((page_num, s))
    flush()
    return chunks


def chunk_txt_sections(spec: dict, txt_path: Path) -> list[dict]:
    raw_text = txt_path.read_text(encoding="utf-8").strip()
    section_re = re.compile(r"(?:^|\n)(§+\s*\d+[a-z]?|Abschnitt\s+[IVX\d]+(?:-[IVX\d]+)?|Ziffer\s+\d+|UKT\s+Vorschrift\s+\d+)")
    splits = section_re.split(raw_text)
    chunks = []
    for i in range(1, len(splits), 2):
        raw_label = splits[i].strip()
        body = (splits[i + 1] if i + 1 < len(splits) else "").strip()
        if len(body) < 15:
            continue
        first_line = body.split("\n")[0].lstrip("–—-: ").strip()
        sec_title = first_line if 3 < len(first_line) < 95 else f"Bestimmungen zu {raw_label}"
        para_label = f"{raw_label} {spec['shortTitle']}"
        chunks.append({
            "docId": spec["id"],
            "docShortTitle": spec["shortTitle"],
            "category": spec["category"],
            "paragraph": para_label,
            "sectionTitle": sec_title,
            "text": body,
            "summary": make_summary(body),
            "keyTakeaways": make_takeaways(para_label, body, spec["currentVersion"]),
            "officialAnchorUrl": resolve_anchor_url(spec, raw_label),
            "tags": list(dict.fromkeys([spec["shortTitle"], spec["category"], raw_label, *spec["tags"]])),
        })
    return chunks


def main():
    documents = []
    all_chunks = []

    for spec in DOCUMENT_SPECS:
        src: Path = spec["source"]
        if not src.exists():
            print(f"⚠️  Quelle fehlt, überspringe: {src}")
            continue

        mode = spec["mode"]
        doc_chunks = []
        if mode in ("law", "structured"):
            if src.suffix.lower() == ".pdf":
                pages = extract_pdf_pages(src)
            elif src.suffix.lower() == ".docx":
                pages = extract_docx_pages(src)
            else:
                pages = [(1, src.read_text(encoding="utf-8"))]
            if not pages:
                print(f"⚠️  Keine extrahierbaren Textseiten in {src.name}")
                continue
            doc_chunks = chunk_law_pages(spec, pages) if mode == "law" else chunk_structured_pages(spec, pages)
        elif mode == "txt_sections":
            doc_chunks = chunk_txt_sections(spec, src)

        for idx, ch in enumerate(doc_chunks):
            ch["id"] = f"chunk-{spec['id']}-{idx + 1}"

        all_chunks.extend(doc_chunks)
        documents.append({
            "id": spec["id"],
            "title": spec["title"],
            "shortTitle": spec["shortTitle"],
            "legalBasis": spec["legalBasis"],
            "category": spec["category"],
            "currentVersion": spec["currentVersion"],
            "lastCheckedDate": "2026-11-16",
            "officialUrl": spec["officialUrl"],
            "description": spec["description"],
            "chunksCount": len(doc_chunks),
            "tags": spec["tags"],
            "isInternal": bool(spec.get("isInternal", False)),
        })
        print(f"  📄 {spec['shortTitle']:38s} -> {len(doc_chunks):4d} Chunks")

    payload = {
        "generatedAt": "2026-11-16",
        "documents": documents,
        "chunks": all_chunks,
    }
    OUT_PATH.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"\n✅ Extraktion fertig: {len(documents)} Dokumente, {len(all_chunks)} Chunks -> {OUT_PATH}")


if __name__ == "__main__":
    main()
