const DIACRITIC_REGEX = /[\u0300-\u036f]/g;

// Simple synonym mapping for common cross-language and semantic matches. Fuse.js handles typos/fuzzy matching, but not semantic equivalence.
const SYNONYMS: Record<string, string[]> = {
  excavator: ['bagger', 'excavation'],
  crane: ['kran'],
  scaffold: ['geruest', 'scaffolding'],
  cleaning: ['reinigung'],
  insulation: ['daemmung'],
};

// removes special characters, lowercases, removes punctuation.
export const normalizeText = (input: string) =>
  input
    .normalize('NFD')
    .replace(DIACRITIC_REGEX, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Expands tokens with synonyms for better matching
export const expandWithSynonyms = (tokens: string[]): string[] => {
  const expanded = new Set<string>();
  tokens.forEach((token) => {
    expanded.add(token);
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach((syn) => expanded.add(syn));
    }
    // Also check reverse mapping
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (values.includes(token)) {
        expanded.add(key);
        values.forEach((syn) => expanded.add(syn));
      }
    });
  });
  return Array.from(expanded);
};
