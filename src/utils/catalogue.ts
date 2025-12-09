import rawCatalogue from '../../data/catalogue.json';
import type { CatalogueItem, RawCatalogue, TradePosition } from '../types';
import { normalizeText } from './normalization';

const raw = rawCatalogue as RawCatalogue;

const toString = (value: string | number | undefined) =>
  !value ? '' : String(value);

// extract all searchable words from position names and descriptions (both EN and DE)
const collectKeywords = (pos: TradePosition) => {
  const parts = [
    pos.short_name_en,
    pos.short_name_de,
    pos.description_en,
    pos.description_de,
  ]
    .filter(Boolean)
    .map((p) => normalizeText(p as string).split(' '))
    .flat()
    .filter(Boolean);
  return Array.from(new Set(parts));
};

export const flattenedCatalogue: CatalogueItem[] = raw.trades.flatMap((trade) =>
  trade.positions
    .map((pos) => {
      const posId = toString(pos.position_number);
      if (!/^\d+$/.test(posId)) return null;
      const shortName = pos.short_name_en || pos.short_name_de;
      if (!shortName) return null;

      return {
        position: `${trade.code}-${posId}`,
        shortName,
        keywords: collectKeywords(pos),
        tags: [
          trade.name_en,
          trade.name_de,
          pos.unit,
          pos.short_name_de,
          pos.short_name_en,
        ]
          .filter(Boolean)
          .map((tag) => normalizeText(tag as string)),
        category: trade.code,
        description: pos.description_en || pos.description_de,
        unit: pos.unit,
        hero: pos.hero,
      } as CatalogueItem;
    })
    .filter((item): item is CatalogueItem => Boolean(item))
);
