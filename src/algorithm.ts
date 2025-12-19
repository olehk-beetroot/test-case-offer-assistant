import Fuse from 'fuse.js';
import type { CatalogueItem, Intake, MatchResult } from './types';
import { expandWithSynonyms, normalizeText } from './utils/normalization';

// weights for scoring, adjust these to change what matters most (must be 100%)
const WEIGHTS = {
  keyword: 0.6, // direct
  fuzzy: 0.3, // fuzzy
  boost: 0.1, // difficult access
};

// which categories get extra points when access is difficult (example)
const BOOST_CATEGORIES = ['0300'];

// break text into words, normalize them, and expand with synonyms
const tokenize = (text: string) =>
  expandWithSynonyms(normalizeText(text).split(' ').filter(Boolean));

// build explanation string for why this item matched
const buildWhy = (
  overlapCount: number,
  tokens: string[],
  keywordSet: Set<string>,
  invertedFuseScore: number,
  boosted: number
): string => {
  let keywordPart: string;

  if (overlapCount > 0) {
    keywordPart = `keywords matched: ${tokens
      .filter((t) => keywordSet.has(t))
      .join(', ')}`;
  } else {
    keywordPart = 'No keywords matched';
  }

  let boostPart: string;
  if (boosted) {
    boostPart = 'boosted for difficult access';
  } else {
    boostPart = 'no boost';
  }

  const parts = [
    keywordPart,
    `fuzzy score ${invertedFuseScore.toFixed(2)}`,
    boostPart,
  ];
  return parts.join('; ');
};

export const matchCatalogue = (
  intake: Intake,
  catalogue: CatalogueItem[]
): MatchResult[] => {
  const tokens = tokenize(intake.description);
  console.log('tokens', tokens, catalogue);
  const tokenSet = new Set(tokens);

  const fuse = new Fuse(catalogue, {
    keys: ['shortName', 'keywords', 'tags'],
    includeScore: true,
    threshold: 0.45, // fuzzy matching threshold
  });

  const fuseResults = new Map<string, number>();
  for (const r of fuse.search(tokens.join(' '))) {
    // higher = better; 0=perfect, 1=bad
    fuseResults.set(r.item.position, 1 - (r.score ?? 1));
  }

  const results: MatchResult[] = [];

  for (const item of catalogue) {
    const normalizedKeywords = item.keywords.map(normalizeText);
    const normalizedTags = (item.tags ?? []).map(normalizeText);

    const keywordSet = new Set([...normalizedKeywords, ...normalizedTags]);

    let overlapCount = 0;
    for (const token of tokenSet) {
      if (keywordSet.has(token)) overlapCount++;
    }
    const keywordScore =
      normalizedKeywords.length === 0
        ? 0
        : overlapCount / normalizedKeywords.length;

    const invertedFuseScore = fuseResults.get(item.position) ?? 0;

    const boosted =
      intake.site.difficultAccess &&
      BOOST_CATEGORIES.some((cat) => item.category?.startsWith(cat))
        ? 1
        : 0;

    const score =
      WEIGHTS.keyword * keywordScore +
      WEIGHTS.fuzzy * invertedFuseScore +
      WEIGHTS.boost * boosted;

    results.push({
      ...item,
      score: Number(score.toFixed(3)),
      why: buildWhy(
        overlapCount,
        tokens,
        keywordSet,
        invertedFuseScore,
        boosted
      ),
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 15);
};

export { WEIGHTS };
