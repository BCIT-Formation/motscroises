import { describe, it, expect } from 'vitest';
import { mulberry32, randomSeed } from '../lib/random';
import { getWordsForDifficulty } from '../lib/words';

describe('mulberry32', () => {
  it('retourne des valeurs dans [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('est déterministe : même graine, même séquence', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produit des séquences différentes pour des graines différentes', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});

describe('randomSeed', () => {
  it('retourne un entier positif sur 31 bits', () => {
    for (let i = 0; i < 100; i++) {
      const s = randomSeed();
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(2147483648);
    }
  });
});

describe('getWordsForDifficulty avec rng injecté', () => {
  it('retourne la même liste pour la même graine', () => {
    const a = getWordsForDifficulty(5, 14, 'tous', 'fr', mulberry32(7));
    const b = getWordsForDifficulty(5, 14, 'tous', 'fr', mulberry32(7));
    expect(a).toEqual(b);
  });

  it('retourne des listes différentes pour des graines différentes', () => {
    const a = getWordsForDifficulty(5, 14, 'tous', 'fr', mulberry32(1));
    const b = getWordsForDifficulty(5, 14, 'tous', 'fr', mulberry32(2));
    expect(a.map((w) => w.word)).not.toEqual(b.map((w) => w.word));
  });
});
