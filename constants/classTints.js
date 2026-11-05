// Timetable classes are saved with a strong colour (see IMPORT_COLORS in
// TimetableScreen). The week grid shows them as soft blocks instead, so each
// colour maps to a pale background with a readable text colour.
const TINTS = {
  '#DC2626': { bg: '#FBE3E6', text: '#9B1C28' },
  '#111111': { bg: '#E8E6E4', text: '#2B2A28' },
  '#71717A': { bg: '#EAEAEE', text: '#4B4B55' },
  '#D97706': { bg: '#FDF0D5', text: '#92590A' },
  '#16A34A': { bg: '#DFF3E4', text: '#176B33' },
  '#2563EB': { bg: '#E1EAFB', text: '#1E429F' },
};

const FALLBACKS = Object.values(TINTS);

// Classes imported before colours existed, or with an unknown colour, still
// need a stable tint: pick one from the subject so it doesn't change on reload.
const hash = (str) =>
  [...String(str)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 997, 7);

export const classTint = (cls) =>
  TINTS[cls?.color] || FALLBACKS[hash(cls?.subject || '') % FALLBACKS.length];
