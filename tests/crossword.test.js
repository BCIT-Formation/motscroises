/**
 * Tests unitaires de lib/crossword.js : placement, numérotation,
 * bounding box et connexité.
 */

import { describe, it, expect } from 'vitest';
import { generateCrossword, getBoundingBox, canPlace, isConnected } from '../lib/crossword';

/** Grille vide NxN (null = case noire). */
function emptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/** Pose un mot manuellement dans une grille (sans validation). */
function put(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;
    grid[r][c] = { letter: word[i] };
  }
}

const WORDS = [
  { word: 'MAISON', clue: 'a' },
  { word: 'SOLEIL', clue: 'b' },
  { word: 'NUAGE',  clue: 'c' },
  { word: 'ECOLE',  clue: 'd' },
  { word: 'TABLE',  clue: 'e' },
  { word: 'ARBRE',  clue: 'f' },
];

describe('canPlace — validation de placement', () => {
  it('accepte le premier mot sans intersection', () => {
    const grid = emptyGrid(10);
    expect(canPlace(grid, 'MAISON', 5, 2, 'across', true)).toBe(true);
  });

  it('refuse un mot qui déborde de la grille', () => {
    const grid = emptyGrid(10);
    expect(canPlace(grid, 'MAISON', 5, 6, 'across', true)).toBe(false);
    expect(canPlace(grid, 'MAISON', 6, 5, 'down', true)).toBe(false);
  });

  it('refuse un mot sans intersection quand ce n\'est pas le premier', () => {
    const grid = emptyGrid(10);
    put(grid, 'MAISON', 5, 2, 'across');
    expect(canPlace(grid, 'TABLE', 0, 0, 'across', false)).toBe(false);
  });

  it('accepte un croisement sur une lettre commune', () => {
    const grid = emptyGrid(12);
    put(grid, 'MAISON', 5, 2, 'across');
    // SOLEIL vertical croisant le S de MAISON (ligne 5, colonne 5)
    expect(canPlace(grid, 'SOLEIL', 5, 5, 'down', false)).toBe(true);
  });

  it('refuse un croisement sur une lettre différente', () => {
    const grid = emptyGrid(10);
    put(grid, 'MAISON', 5, 2, 'across');
    // TABLE vertical dont le T devrait remplacer le M de MAISON
    expect(canPlace(grid, 'TABLE', 5, 2, 'down', false)).toBe(false);
  });

  it('refuse une adjacence latérale sans croisement', () => {
    const grid = emptyGrid(10);
    put(grid, 'MAISON', 5, 2, 'across');
    // Mot horizontal juste en dessous : les lettres se toucheraient
    expect(canPlace(grid, 'TABLE', 6, 2, 'across', false)).toBe(false);
  });

  it('refuse un mot collé avant ou après un mot existant', () => {
    const grid = emptyGrid(12);
    put(grid, 'MAISON', 5, 3, 'across');
    // Mot horizontal sur la même ligne, collé à la fin de MAISON
    expect(canPlace(grid, 'SOL', 5, 9, 'across', false)).toBe(false);
  });
});

describe('generateCrossword — placement', () => {
  it('place le premier mot (le plus long) horizontalement au centre', () => {
    const result = generateCrossword(WORDS, 11);
    const first = result.placedWords.find((w) => w.word === 'MAISON' || w.word === 'SOLEIL');
    expect(first).toBeDefined();
    expect(first.dir).toBe('across');
    expect(first.row).toBe(5); // Math.floor(11 / 2)
  });

  it('écrit chaque mot placé dans la grille, lettre par lettre', () => {
    const result = generateCrossword(WORDS, 11);
    expect(result.placedWords.length).toBeGreaterThanOrEqual(2);
    for (const pw of result.placedWords) {
      for (let i = 0; i < pw.word.length; i++) {
        const r = pw.dir === 'across' ? pw.row : pw.row + i;
        const c = pw.dir === 'across' ? pw.col + i : pw.col;
        expect(result.grid[r][c]).not.toBeNull();
        expect(result.grid[r][c].letter).toBe(pw.word[i]);
      }
    }
  });

  it('ne place aucun mot plus long que la grille', () => {
    const result = generateCrossword([{ word: 'ANTICONSTITUTIONNEL', clue: 'x' }], 10);
    expect(result.placedWords).toHaveLength(0);
  });

  it('ne plante pas quand un mot dépasse la grille d\'exactement une lettre', () => {
    // Cas limite : col devient -1 mais col + len === size, le contrôle de
    // débordement ne suffisait pas (lecture hors grille).
    const result = generateCrossword([{ word: 'CONSTITUTION', clue: 'x' }], 11);
    expect(result.placedWords).toHaveLength(0);
  });

  it('ne place qu\'un seul mot si aucune lettre n\'est partagée', () => {
    const result = generateCrossword(
      [
        { word: 'AAA', clue: 'x' },
        { word: 'BBB', clue: 'y' },
        { word: 'CCC', clue: 'z' },
      ],
      10
    );
    expect(result.placedWords).toHaveLength(1);
  });

  it('répartit les indices entre horizontaux et verticaux', () => {
    const result = generateCrossword(WORDS, 13);
    expect(result.acrossClues.length + result.downClues.length).toBe(result.placedWords.length);
    for (const clue of result.acrossClues) {
      expect(result.placedWords.some((w) => w.word === clue.word && w.dir === 'across')).toBe(true);
    }
    for (const clue of result.downClues) {
      expect(result.placedWords.some((w) => w.word === clue.word && w.dir === 'down')).toBe(true);
    }
  });
});

describe('generateCrossword — numérotation', () => {
  it('attribue un numéro à chaque mot placé', () => {
    const result = generateCrossword(WORDS, 13);
    for (const pw of result.placedWords) {
      expect(pw.number).not.toBeNull();
      expect(pw.number).toBeGreaterThanOrEqual(1);
    }
  });

  it('numérote en ordre croissant de haut en bas puis de gauche à droite', () => {
    const result = generateCrossword(WORDS, 13);
    const seen = [];
    for (let r = 0; r < result.size; r++) {
      for (let c = 0; c < result.size; c++) {
        if (result.numbers[r][c] !== null) seen.push(result.numbers[r][c]);
      }
    }
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    // Numéros consécutifs à partir de 1, sans doublon
    expect(seen).toEqual(Array.from({ length: seen.length }, (_, i) => i + 1));
  });

  it('trie les listes d\'indices par numéro croissant', () => {
    const result = generateCrossword(WORDS, 13);
    const acrossNums = result.acrossClues.map((c) => c.number);
    const downNums = result.downClues.map((c) => c.number);
    expect(acrossNums).toEqual([...acrossNums].sort((a, b) => a - b));
    expect(downNums).toEqual([...downNums].sort((a, b) => a - b));
  });
});

describe('getBoundingBox', () => {
  it('retourne la grille entière quand elle est vide', () => {
    expect(getBoundingBox(emptyGrid(10))).toEqual({ minR: 0, maxR: 9, minC: 0, maxC: 9 });
  });

  it('retourne la zone minimale contenant les lettres', () => {
    const grid = emptyGrid(10);
    put(grid, 'SOL', 4, 2, 'across');
    put(grid, 'SUD', 4, 2, 'down');
    expect(getBoundingBox(grid)).toEqual({ minR: 4, maxR: 6, minC: 2, maxC: 4 });
  });

  it('retourne une zone d\'une seule case pour une seule lettre', () => {
    const grid = emptyGrid(10);
    grid[7][3] = { letter: 'A' };
    expect(getBoundingBox(grid)).toEqual({ minR: 7, maxR: 7, minC: 3, maxC: 3 });
  });
});

describe('isConnected — connexité', () => {
  it('considère une grille vide comme connexe', () => {
    expect(isConnected(emptyGrid(10))).toBe(true);
  });

  it('détecte une grille connexe', () => {
    const grid = emptyGrid(12);
    put(grid, 'MAISON', 5, 2, 'across');
    put(grid, 'SOLEIL', 5, 5, 'down');
    expect(isConnected(grid)).toBe(true);
  });

  it('détecte une grille non connexe', () => {
    const grid = emptyGrid(10);
    put(grid, 'SOL', 0, 0, 'across');
    put(grid, 'SUD', 8, 6, 'across'); // Deux îlots séparés
    expect(isConnected(grid)).toBe(false);
  });

  it('les grilles générées sont toujours connexes', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateCrossword(WORDS, 13);
      expect(isConnected(result.grid)).toBe(true);
    }
  });
});
