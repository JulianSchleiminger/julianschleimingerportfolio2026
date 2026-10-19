// Platzhalter-Inhalte für die Richtungsprototypen (Phase 2).
// Alle Projekte, Kunden und Texte sind erfunden und werden durch echte Inhalte ersetzt.

export type Format = '4:5' | '16:9' | '9:16' | '3:4' | '1:1';

export interface PlaceholderProject {
  slug: string;
  title: string;
  client: string;
  year: number;
  disciplines: string[];
  format: Format;
  video: boolean;
}

export const person = {
  name: 'Julian Schleiminger',
  role: 'Art Director',
  claim: 'Ich denke Marken und Kampagnen und setze sie selbst um.',
  intro:
    'Branding, Werbung im Tagesgeschäft, Social. Alles, was ich kann, habe ich mir selbst beigebracht, und genau so arbeite ich: neugierig, schnell im Lernen, nah am fertigen Produkt. Jetzt suche ich eine Festanstellung als Art Director, gern in Berlin.',
  email: 'hallo@julianschleiminger.de',
  skills: ['Branding', 'Print', 'Digital', 'Social', 'Video'],
};

export const projects: PlaceholderProject[] = [
  { slug: 'roesterei', title: 'Markenrelaunch Kaffeerösterei', client: 'Kunde A', year: 2025, disciplines: ['Branding'], format: '4:5', video: false },
  { slug: 'modehandel', title: 'Saisonkampagne Modehandel', client: 'Kunde B', year: 2025, disciplines: ['Print', 'Digital'], format: '16:9', video: false },
  { slug: 'sportverein', title: 'Social-Serie Sportverein', client: 'Kunde C', year: 2024, disciplines: ['Social', 'Video'], format: '9:16', video: true },
  { slug: 'festival', title: 'Erscheinungsbild Kulturfestival', client: 'Kunde D', year: 2024, disciplines: ['Branding', 'Print'], format: '3:4', video: false },
  { slug: 'app-launch', title: 'Launch-Kampagne App', client: 'Kunde E', year: 2024, disciplines: ['Digital', 'Social'], format: '16:9', video: true },
  { slug: 'feinkost', title: 'Verpackung Feinkostlinie', client: 'Kunde F', year: 2023, disciplines: ['Branding', 'Print'], format: '1:1', video: false },
  { slug: 'stiftung', title: 'Jahresbericht Stiftung', client: 'Kunde G', year: 2023, disciplines: ['Print'], format: '3:4', video: false },
  { slug: 'handwerk', title: 'Recruiting-Kampagne Handwerk', client: 'Kunde H', year: 2023, disciplines: ['Digital', 'Social', 'Video'], format: '4:5', video: true },
  { slug: 'moebel', title: 'Produktclip Möbelmarke', client: 'Kunde I', year: 2022, disciplines: ['Video'], format: '16:9', video: true },
];

// Beispielprojekt für die Projektseiten der Prototypen.
export const caseStudy = {
  project: projects[0],
  role: 'Art Direction, Design, Umsetzung',
  sections: [
    { heading: 'Aufgabe', text: 'Platzhalter: Eine kleine Rösterei will aus dem Regal des Bioladens heraus in die Gastronomie. Der alte Auftritt wirkte austauschbar.' },
    { heading: 'Idee', text: 'Platzhalter: Jede Sorte bekommt eine eigene Farbwelt aus ihrem Herkunftsland, zusammengehalten von einer kräftigen Wortmarke.' },
    { heading: 'Umsetzung', text: 'Platzhalter: Logo, Verpackungssystem, Speisekarten, Social-Templates und ein kurzer Clip für den Launch. Konzept, Gestaltung und Reinzeichnung aus einer Hand.' },
    { heading: 'Ergebnis', text: 'Platzhalter: Hier steht später ein Satz zum Ergebnis, ohne erfundene Zahlen.' },
  ],
  gallery: [
    { format: '16:9', label: 'Keyvisual' },
    { format: '4:5', label: 'Verpackung' },
    { format: '4:5', label: 'Detail' },
    { format: '1:1', label: 'Social-Post' },
    { format: '9:16', label: 'Clip', video: true },
    { format: '3:4', label: 'Speisekarte' },
  ] as { format: Format; label: string; video?: boolean }[],
};

export const ratio = (f: Format) => f.replace(':', ' / ');
