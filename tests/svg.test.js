import { describe, it, expect } from 'vitest';
import { generateCrossword } from '../lib/crossword';
import { crosswordToSVG } from '../lib/svg';

const WORDS = [
  { word: 'CHAT',   clue: 'Félin' },
  { word: 'TABLE',  clue: 'Meuble' },
  { word: 'ARBRE',  clue: 'Végétal' },
  { word: 'ECOLE',  clue: 'Lieu' },
];

function makeData() {
  return generateCrossword(WORDS, 10);
}

describe('crosswordToSVG', () => {
  it('retourne un document SVG valide', () => {
    const svg = crosswordToSVG(makeData());
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.trim().endsWith('</svg>')).toBe(true);
  });

  it('dessine une case par cellule de la zone utile', () => {
    const data = makeData();
    const svg = crosswordToSVG(data);
    // +1 : le rectangle de fond
    const rects = svg.match(/<rect /g) || [];
    expect(rects.length).toBeGreaterThan(1);
  });

  it('n\'inclut pas les lettres par défaut', () => {
    const data = makeData();
    const svg = crosswordToSVG(data, { showLetters: false });
    expect(svg).not.toContain('dominant-baseline="central"');
  });

  it('inclut les lettres quand showLetters est actif', () => {
    const data = makeData();
    const svg = crosswordToSVG(data, { showLetters: true });
    expect(svg).toContain('dominant-baseline="central"');
    // Chaque lettre placée doit apparaître dans le SVG
    for (const pw of data.placedWords) {
      for (const letter of pw.word) {
        expect(svg).toContain(`>${letter}</text>`);
      }
    }
  });

  it('inclut les numéros des cases de départ', () => {
    const data = makeData();
    const svg = crosswordToSVG(data);
    expect(svg).toContain('>1</text>');
  });

  it('respecte la taille de case demandée', () => {
    const data = makeData();
    const svg = crosswordToSVG(data, { cellSize: 40 });
    expect(svg).toContain('width="40" height="40"');
  });
});
