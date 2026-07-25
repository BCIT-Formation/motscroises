/**
 * Tests unitaires de lib/words.js : intégrité de la banque de mots
 * et filtrage par difficulté et par thème.
 */

import { describe, it, expect } from 'vitest';
import { WORD_BANK, THEMES, getWordsForDifficulty, getGridSize, getWordCount } from '../lib/words';

describe('WORD_BANK — intégrité de la banque', () => {
  it('contient au moins 500 mots', () => {
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(500);
  });

  it('ne contient aucun doublon', () => {
    const words = WORD_BANK.map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it('ne contient que des mots en majuscules A-Z, de 3 à 15 lettres', () => {
    // 15 = taille maximale des grilles générées : au-delà, le mot est implaçable
    for (const { word } of WORD_BANK) {
      expect(word).toMatch(/^[A-Z]{3,15}$/);
    }
  });

  it('chaque entrée a un indice, un niveau valide et une catégorie', () => {
    for (const entry of WORD_BANK) {
      expect(entry.clue.length).toBeGreaterThan(0);
      expect(entry.level).toBeGreaterThanOrEqual(1);
      expect(entry.level).toBeLessThanOrEqual(10);
      expect(entry.cat.length).toBeGreaterThan(0);
    }
  });

  it('chaque thème (hors « tous ») correspond à des catégories existantes et non vides', () => {
    const usedCats = new Set(WORD_BANK.map((w) => w.cat));
    for (const theme of THEMES.filter((t) => t.cats !== null)) {
      for (const cat of theme.cats) {
        expect(usedCats.has(cat)).toBe(true);
      }
      const pool = WORD_BANK.filter((w) => theme.cats.includes(w.cat));
      expect(pool.length).toBeGreaterThan(0);
    }
  });
});

describe('getWordsForDifficulty — filtrage par difficulté', () => {
  it('difficulté 1-2 : uniquement des mots de niveau 1 à 2', () => {
    for (const w of getWordsForDifficulty(1, 10)) {
      expect(w.level).toBeGreaterThanOrEqual(1);
      expect(w.level).toBeLessThanOrEqual(2);
    }
  });

  it('difficulté 5-6 : uniquement des mots de niveau 3 à 6', () => {
    for (const w of getWordsForDifficulty(5, 14)) {
      expect(w.level).toBeGreaterThanOrEqual(3);
      expect(w.level).toBeLessThanOrEqual(6);
    }
  });

  it('difficulté 9-10 : uniquement des mots de niveau 7 à 10', () => {
    for (const w of getWordsForDifficulty(10, 22)) {
      expect(w.level).toBeGreaterThanOrEqual(7);
      expect(w.level).toBeLessThanOrEqual(10);
    }
  });

  it('retourne exactement le nombre de mots demandé quand la banque suffit', () => {
    expect(getWordsForDifficulty(5, 14)).toHaveLength(14);
  });

  it('plafonne au nombre de mots disponibles', () => {
    const result = getWordsForDifficulty(1, 100000);
    expect(result.length).toBeLessThanOrEqual(WORD_BANK.length);
    expect(result.length).toBeGreaterThan(0);
  });

  it('ne retourne jamais de mot de moins de 3 lettres', () => {
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      for (const w of getWordsForDifficulty(difficulty, 50)) {
        expect(w.word.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('ne retourne pas de doublons', () => {
    const words = getWordsForDifficulty(5, 100).map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });
});

describe('getWordsForDifficulty — filtrage par thème', () => {
  it('ne retourne que des mots des catégories du thème', () => {
    for (const theme of THEMES.filter((t) => t.cats !== null)) {
      for (const w of getWordsForDifficulty(5, 10, theme.id)) {
        expect(theme.cats).toContain(w.cat);
      }
    }
  });

  it('« tous » ne filtre pas par catégorie', () => {
    const cats = new Set(getWordsForDifficulty(3, 100, 'tous').map((w) => w.cat));
    expect(cats.size).toBeGreaterThan(1);
  });

  it('élargit aux autres niveaux quand le thème manque de mots dans la plage', () => {
    // Quel que soit le thème et la difficulté, on doit obtenir assez de mots
    // pour tenter une grille (le repli élargit la plage de niveaux).
    for (const theme of THEMES) {
      for (const difficulty of [1, 5, 10]) {
        const result = getWordsForDifficulty(difficulty, getWordCount(difficulty), theme.id);
        expect(result.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('un thème inconnu se comporte comme « tous »', () => {
    expect(getWordsForDifficulty(5, 14, 'inexistant')).toHaveLength(14);
  });
});

describe('getGridSize / getWordCount', () => {
  it('la taille de grille croît avec la difficulté', () => {
    let previous = 0;
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      const size = getGridSize(difficulty);
      expect(size).toBeGreaterThanOrEqual(previous);
      previous = size;
    }
    expect(getGridSize(1)).toBe(10);
    expect(getGridSize(10)).toBe(15);
  });

  it('le nombre de mots croît avec la difficulté', () => {
    let previous = 0;
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      const count = getWordCount(difficulty);
      expect(count).toBeGreaterThanOrEqual(previous);
      previous = count;
    }
    expect(getWordCount(1)).toBe(8);
    expect(getWordCount(10)).toBe(22);
  });

  it('aucun mot de la banque ne dépasse la plus grande grille', () => {
    const maxSize = getGridSize(10);
    for (const { word } of WORD_BANK) {
      expect(word.length).toBeLessThanOrEqual(maxSize);
    }
  });
});
