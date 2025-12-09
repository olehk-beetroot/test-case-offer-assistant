import { describe, expect, it } from 'vitest';
import { matchCatalogue, WEIGHTS } from './algorithm';
import type { CatalogueItem, Intake } from './types';

describe('algorithm', () => {
  describe('weights', () => {
    it('should have weights that sum to 1.0', () => {
      const sum = WEIGHTS.keyword + WEIGHTS.fuzzy + WEIGHTS.boost;
      expect(sum).toBeCloseTo(1.0, 5);
    });
  });

  describe('matchCatalogue', () => {
    const createIntake = (
      description: string,
      difficultAccess = false
    ): Intake => ({
      customer: {
        name: 'Test Customer',
        phone: '123456789',
        email: 'test@example.com',
        address: 'Test Address',
      },
      description,
      site: {
        difficultAccess,
      },
    });

    const createCatalogueItem = (
      position: string,
      shortName: string,
      keywords: string[],
      tags?: string[],
      category?: string
    ): CatalogueItem => ({
      position,
      shortName,
      keywords,
      tags,
      category,
    });

    it('should return empty array for empty catalogue', () => {
      const intake = createIntake('test description');
      const result = matchCatalogue(intake, []);
      expect(result).toEqual([]);
    });

    it('should return results sorted by score descending', () => {
      const intake = createIntake('excavator digging');
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Low Match', ['other', 'words']),
        createCatalogueItem('002', 'High Match', ['excavator', 'digging']),
        createCatalogueItem('003', 'Medium Match', ['excavator']),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1]?.score ?? 0);
      if (result.length > 1) {
        expect(result[1].score).toBeGreaterThanOrEqual(result[2]?.score ?? 0);
      }
    });

    it('should limit results to 15 items', () => {
      const intake = createIntake('test');
      const catalogue: CatalogueItem[] = Array.from({ length: 20 }, (_, i) =>
        createCatalogueItem(`pos${i}`, `Item ${i}`, ['test'])
      );

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBeLessThanOrEqual(15);
    });

    it('should match items by keywords', () => {
      const intake = createIntake('excavator digging');
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Excavator Work', ['excavator', 'digging']),
        createCatalogueItem('002', 'Unrelated', ['crane', 'lifting']),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(2);
      expect(result[0].position).toBe('001');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should boost score for difficult access sites with boost categories', () => {
      const intake = createIntake('test', true);
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Boosted Item', ['test'], [], '0300'),
        createCatalogueItem('002', 'Regular Item', ['test'], [], '0400'),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(2);
      expect(result[0].position).toBe('001');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should handle empty description', () => {
      const intake = createIntake('');
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Item', ['test']),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(1);
      expect(result[0].score).toBeGreaterThanOrEqual(0);
    });

    it('should include why explanation in results', () => {
      const intake = createIntake('excavator');
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Excavator', ['excavator']),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(1);
      expect(result[0].why).toBeDefined();
      expect(typeof result[0].why).toBe('string');
      expect(result[0].why.length).toBeGreaterThan(0);
    });

    it('should handle synonyms correctly', () => {
      const intake = createIntake('bagger'); // synonym for excavator
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Excavator', ['excavator']),
        createCatalogueItem('002', 'Unrelated', ['crane']),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(2);
      expect(result[0].position).toBe('001');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should preserve all item properties in results', () => {
      const intake = createIntake('test');
      const catalogue: CatalogueItem[] = [
        createCatalogueItem('001', 'Test Item', ['test'], ['tag1'], '0100'),
      ];

      const result = matchCatalogue(intake, catalogue);
      expect(result.length).toBe(1);
      expect(result[0].position).toBe('001');
      expect(result[0].shortName).toBe('Test Item');
      expect(result[0].keywords).toEqual(['test']);
      expect(result[0].tags).toEqual(['tag1']);
      expect(result[0].category).toBe('0100');
      expect(result[0].score).toBeDefined();
      expect(result[0].why).toBeDefined();
    });
  });
});
