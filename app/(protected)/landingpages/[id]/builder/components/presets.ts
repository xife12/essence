// Preset-Definitionen für alle Blöcke
import { LucideIcon, Square, Columns, Rows, Grid3X3, Layers } from 'lucide-react';

export const BLOCK_PRESETS = {
  header: [
    { value: 'hero-centered', label: 'Hero Zentriert', description: 'Große Überschrift in der Mitte' },
    { value: 'hero-split', label: 'Hero Split', description: 'Text links, Bild rechts' },
    { value: 'image-overlay', label: 'Bild Overlay', description: 'Text über Hintergrundbild' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'clean-color', label: 'Farbig', description: 'Mit Hintergrundfarbe' }
  ],
  text: [
    { value: 'default', label: 'Standard', description: 'Normaler Fließtext' },
    { value: 'classic-paragraph', label: 'Klassisch', description: 'Traditionelles Layout' },
    { value: 'two-column-info', label: 'Zwei Spalten', description: 'Text in zwei Spalten' },
    { value: 'callout-quote', label: 'Zitat', description: 'Hervorgehobenes Zitat' },
    { value: 'info-card', label: 'Info-Card', description: 'Text in einer Karte' }
  ],
  image: [
    { value: 'default', label: 'Standard', description: 'Einfaches Bild' },
    { value: 'lightbox-grid', label: 'Galerie', description: 'Bild-Galerie mit Lightbox' },
    { value: 'scroll-carousel', label: 'Karussell', description: 'Horizontales Scrollen' },
    { value: 'wide-banner', label: 'Banner', description: 'Vollbreites Banner-Bild' },
    { value: 'hover-zoom', label: 'Hover Zoom', description: 'Zoom-Effekt bei Hover' },
    { value: 'split-image-text', label: 'Split Layout', description: 'Bild und Text nebeneinander' }
  ],
  video: [
    { value: 'default', label: 'Standard', description: 'Einfaches Video' },
    { value: 'clean-video', label: 'Clean', description: 'Minimalistisches Design' },
    { value: 'framed', label: 'Gerahmt', description: 'Video mit Rahmen' },
    { value: 'side-by-side', label: 'Nebeneinander', description: 'Video und Text' },
    { value: 'overlay-start', label: 'Overlay Start', description: 'Mit Play-Button Overlay' },
    { value: 'youtube-card', label: 'YouTube Card', description: 'YouTube-ähnliches Design' }
  ],
  button: [
    { value: 'default', label: 'Standard', description: 'Normaler Button' },
    { value: 'flat', label: 'Flach', description: 'Ohne Schatten' },
    { value: 'rounded', label: 'Rund', description: 'Abgerundete Ecken' },
    { value: 'ghost', label: 'Ghost', description: 'Nur Umrandung' },
    { value: 'shadowed', label: 'Schatten', description: 'Mit Schatten-Effekt' },
    { value: 'icon-text', label: 'Mit Icon', description: 'Button mit Icon' }
  ],
  form: [
    { value: 'default', label: 'Standard', description: 'Klassisches Formular' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'clean-color', label: 'Farbig', description: 'Mit Hintergrundfarbe' },
    { value: 'inline', label: 'Inline', description: 'Horizontales Layout' }
  ],
  icon: [
    { value: 'default', label: 'Standard', description: 'Icons in einer Reihe' },
    { value: 'grid', label: 'Grid', description: 'Icons im Raster' },
    { value: 'circular', label: 'Rund', description: 'Runde Icon-Container' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Icons ohne Container' }
  ],
  testimonial: [
    { value: 'default', label: 'Standard', description: 'Klassische Testimonials' },
    { value: 'classic', label: 'Klassisch', description: 'Text links, Testimonials rechts' },
    { value: 'grid', label: 'Grid', description: 'Testimonials im Raster' },
    { value: 'cards', label: 'Karten', description: 'Als Karten-Layout mit Border' },
    { value: 'carousel', label: 'Karussell', description: 'Einzelnes Testimonial mit Navigation' },
    { value: 'centered', label: 'Zentriert', description: 'Ein Testimonial zentriert' },
    { value: 'minimal', label: 'Minimal', description: 'Reduzierte Testimonials' },
    { value: 'compact', label: 'Kompakt', description: 'Kleine Testimonial-Karten' }
  ],
  pricing: [
    { value: 'default', label: 'Standard', description: 'Klassische Preistabelle' },
    { value: 'cards', label: 'Karten', description: 'Als separate Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'highlight', label: 'Highlight', description: 'Mit hervorgehobenem Plan' }
  ],
  feature: [
    { value: 'default', label: 'Standard', description: 'Features in einer Liste' },
    { value: 'grid', label: 'Grid', description: 'Features im Raster' },
    { value: 'alternating', label: 'Abwechselnd', description: 'Links-rechts-Layout' },
    { value: 'centered', label: 'Zentriert', description: 'Alle Features zentriert' }
  ],
  countdown: [
    { value: 'default', label: 'Standard', description: 'Klassischer Countdown' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'bold', label: 'Fett', description: 'Große, fette Zahlen' },
    { value: 'circular', label: 'Rund', description: 'Runde Countdown-Boxen' }
  ],
  service: [
    { value: 'default', label: 'Standard', description: 'Services als Liste' },
    { value: 'cards', label: 'Karten', description: 'Services als Karten' },
    { value: 'table', label: 'Tabelle', description: 'Als Tabellen-Layout' },
    { value: 'grid', label: 'Grid', description: 'Services im Raster' }
  ],
  faq: [
    { value: 'default', label: 'Standard', description: 'Klassisches Accordion' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'cards', label: 'Karten', description: 'FAQ als Karten' },
    { value: 'two-column', label: 'Zwei Spalten', description: 'FAQ in zwei Spalten' }
  ],
  contact: [
    { value: 'default', label: 'Standard', description: 'Klassische Kontakt-Info' },
    { value: 'cards', label: 'Karten', description: 'Info als Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'centered', label: 'Zentriert', description: 'Alle Infos zentriert' }
  ],
  team: [
    { value: 'default', label: 'Standard', description: 'Team-Mitglieder als Karten' },
    { value: 'grid', label: 'Grid', description: 'Team im Raster' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Team-Liste' }
  ],
  statistics: [
    { value: 'default', label: 'Standard', description: 'Statistiken in einer Reihe' },
    { value: 'cards', label: 'Karten', description: 'Stats als Karten' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Zahlen und Labels' },
    { value: 'circular', label: 'Rund', description: 'Runde Statistik-Container' }
  ],
  trust_logos: [
    { value: 'default', label: 'Standard', description: 'Logos in einer Reihe' },
    { value: 'grid', label: 'Grid', description: 'Logos im Raster' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Logo-Liste' },
    { value: 'minimal', label: 'Minimal', description: 'Nur Logos ohne Container' }
  ],
  gallery: [
    { value: 'default', label: 'Standard', description: 'Klassische Galerie' },
    { value: 'masonry', label: 'Masonry', description: 'Pinterest-Style Layout' },
    { value: 'carousel', label: 'Karussell', description: 'Scrollbare Galerie' },
    { value: 'lightbox', label: 'Lightbox', description: 'Mit Lightbox-Effekt' }
  ],
  blog_preview: [
    { value: 'default', label: 'Standard', description: 'Blog-Artikel als Karten' },
    { value: 'list', label: 'Liste', description: 'Als einfache Liste' },
    { value: 'grid', label: 'Grid', description: 'Artikel im Raster' },
    { value: 'featured', label: 'Featured', description: 'Mit hervorgehobenem Artikel' }
  ],
  courseplan: [
    { value: 'default', label: 'Standard', description: 'Klassischer Kursplan' },
    { value: 'calendar', label: 'Kalender', description: 'Als Kalender-Layout' },
    { value: 'timeline', label: 'Timeline', description: 'Als Timeline-Layout' },
    { value: 'cards', label: 'Karten', description: 'Kurse als Karten' }
  ],
  gamification: [
    { value: 'default', label: 'Standard', description: 'Klassisches Glücksrad' },
    { value: 'modern', label: 'Modern', description: 'Modernes Design' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'colorful', label: 'Bunt', description: 'Bunte Farbgebung' }
  ],
  cta: [
    { value: 'default', label: 'Standard', description: 'Klassischer Call-to-Action' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' },
    { value: 'bold', label: 'Fett', description: 'Großer, fetter CTA' },
    { value: 'centered', label: 'Zentriert', description: 'Zentrierter CTA' }
  ],
  hero: [
    { value: 'default', label: 'Standard', description: 'Klassischer Hero-Bereich' },
    { value: 'split', label: 'Split', description: 'Text und Bild nebeneinander' },
    { value: 'overlay', label: 'Overlay', description: 'Text über Hintergrundbild' },
    { value: 'minimal', label: 'Minimal', description: 'Reduziertes Design' }
  ]
}; 