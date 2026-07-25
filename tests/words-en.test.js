import { describe, it, expect } from 'vitest';
import { WORD_BANK_EN } from '../lib/words-en';
import { getWordsForDifficulty, THEMES } from '../lib/words';

describe('WORD_BANK_EN', () => {
  it('contient uniquement des mots A-Z de 3 à 15 lettres', () => {
    for (const entry of WORD_BANK_EN) {
      expect(entry.word).toMatch(/^[A-Z]{3,15}$/);
    }
  });

  it('ne contient aucun doublon', () => {
    const words = WORD_BANK_EN.map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it('a un indice et une catégorie pour chaque mot', () => {
    for (const entry of WORD_BANK_EN) {
      expect(typeof entry.clue).toBe('string');
      expect(entry.clue.length).toBeGreaterThan(0);
      expect(typeof entry.cat).toBe('string');
      expect(entry.cat.length).toBeGreaterThan(0);
    }
  });

  it('a des niveaux entre 1 et 10', () => {
    for (const entry of WORD_BANK_EN) {
      expect(entry.level).toBeGreaterThanOrEqual(1);
      expect(entry.level).toBeLessThanOrEqual(10);
    }
  });

  it('couvre toutes les plages de difficulté', () => {
    expect(WORD_BANK_EN.some((w) => w.level <= 2)).toBe(true);
    expect(WORD_BANK_EN.some((w) => w.level >= 3 && w.level <= 4)).toBe(true);
    expect(WORD_BANK_EN.some((w) => w.level >= 5 && w.level <= 6)).toBe(true);
    expect(WORD_BANK_EN.some((w) => w.level >= 7 && w.level <= 8)).toBe(true);
    expect(WORD_BANK_EN.some((w) => w.level >= 9)).toBe(true);
  });
});

describe('getWordsForDifficulty (lang=en)', () => {
  it('retourne des mots de la banque anglaise', () => {
    const enWords = new Set(WORD_BANK_EN.map((w) => w.word));
    const result = getWordsForDifficulty(3, 10, 'tous', 'en');
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      expect(enWords.has(w.word)).toBe(true);
    }
  });

  it('respecte le filtre de thème en anglais', () => {
    const result = getWordsForDifficulty(1, 8, 'animaux', 'en');
    expect(result.length).toBeGreaterThan(0);
    for (const w of result) {
      expect(w.cat).toBe('animaux');
    }
  });

  it('chaque thème fournit au moins un mot anglais', () => {
    for (const theme of THEMES) {
      const result = getWordsForDifficulty(5, 5, theme.id, 'en');
      expect(result.length, `thème ${theme.id}`).toBeGreaterThan(0);
    }
  });
});
