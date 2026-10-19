# Portfolio Julian Schleiminger

Neue Portfolio-Website (Grafikdesign, Art Direction) für julianschleiminger.de.
Kompletter Neuanfang: Von der alten Rails-Seite wird kein Code übernommen, nur Inhalte.
Sprache mit Julian und auf der Seite: Deutsch. Code, Commits und PRs: Englisch.

## Rollen

Julian ist Art Director und entscheidet über die visuelle Richtung. Claude setzt um,
prüft per Screenshot und schlägt vor. Keine eigenmächtigen Stilwechsel.

## Steuerdateien (zuerst lesen)

- `PRODUCT.md`: Zielgruppe, Zweck, Tonalität. Entsteht in Phase 2 mit `/impeccable init`.
- `DESIGN.md`: das visuelle System. Entsteht in Phase 2, wenn die Richtung feststeht.
- `src/styles/tokens.css`: alle Farben, Schriften, Abstände, Raster als Custom Properties.
  Im übrigen CSS nur Tokens verwenden, keine freien Werte. Neue Werte erst als Token anlegen.

Solange PRODUCT.md und DESIGN.md fehlen, sind die Tokens neutrale Platzhalter.

## Stack und Befehle

- Astro 7, statisch, reines CSS (kein Tailwind), keine UI-Bibliothek.
- `npm run dev`: lokaler Server
- `npm run build`: Build nach `dist/`
- `npm run shots`: Build plus Screenshots aller Seiten (mobil, tablet, desktop) nach `screenshots/`.
  `npm run shots -- /about/` für einzelne Pfade. Lokal einmalig `npx playwright install chromium`.

## Struktur

- `src/content/projects/*.md`: ein Projekt pro Datei, Schema in `src/content.config.ts`.
- `src/assets/projects/<projekt>/`: Bilder pro Projekt, im Frontmatter z. B.
  `cover: ../../assets/projects/<projekt>/cover.jpg`. Bilder immer über `astro:assets` (`<Image>`) ausgeben.
- `src/pages/`: Startseite, `projekte/[slug].astro`, `about.astro`, `404.astro`.
- `src/layouts/`, `src/components/`: Layout und wiederverwendbare Teile.

## Arbeitsregeln

- Jede sichtbare Änderung mit `npm run shots` prüfen und Screenshots ansehen, bevor sie als fertig gilt.
  Prüfungen bündeln: erst alles beheben, was ein Durchgang zeigt, dann neu prüfen.
- Design-Arbeit läuft über den Impeccable-Skill (`.claude/skills/impeccable`). Der Design-Hook
  meldet Anti-Patterns nach jeder Änderung an UI-Dateien.
- Entscheidungen, die Julian bestätigt, in DESIGN.md festschreiben.
- Kleine, thematische Commits. Größere Umbauten erst als Plan zeigen.
- Barrierefreiheit: semantisches HTML, sinnvolle `alt`-Texte, ausreichender Kontrast.
