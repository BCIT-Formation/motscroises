import { describe, it, expect } from 'vitest';
import { emptyStats, recordGrids, topWords } from '../lib/stats';

function grid(words) {
  return { placedWords: words.map((w) => ({ word: w })) };
}

describe('emptyStats', () => {
  it('retourne une structure vide', () => {
    expect(emptyStats()).toEqual({ totalGrids: 0, totalWords: 0, wordCounts: {} });
  });
});

describe('recordGrids', () => {
  it('comptabilise les grilles et les mots', () => {
    const stats = recordGrids(emptyStats(), [grid(['CHAT', 'TABLE']), grid(['CHAT'])]);
    expect(stats.totalGrids).toBe(2);
    expect(stats.totalWords).toBe(3);
    expect(stats.wordCounts).toEqual({ CHAT: 2, TABLE: 1 });
  });

  it('cumule avec des statistiques existantes', () => {
    const first = recordGrids(emptyStats(), [grid(['CHAT'])]);
    const second = recordGrids(first, [grid(['TABLE', 'CHAT'])]);
    expect(second.totalGrids).toBe(2);
    expect(second.totalWords).toBe(3);
    expect(second.wordCounts.CHAT).toBe(2);
  });

  it('ne modifie pas l\'objet d\'entrée (fonction pure)', () => {
    const before = emptyStats();
    recordGrids(before, [grid(['CHAT'])]);
    expect(before).toEqual(emptyStats());
  });
});

describe('topWords', () => {
  it('trie par fréquence décroissante puis par ordre alphabétique', () => {
    let stats = emptyStats();
    stats = recordGrids(stats, [grid(['CHAT', 'TABLE', 'ARBRE'])]);
    stats = recordGrids(stats, [grid(['CHAT', 'ARBRE', 'TABLE'])]);
    stats = recordGrids(stats, [grid(['CHAT'])]);
    expect(topWords(stats, 3)).toEqual([
      { word: 'CHAT', count: 3 },
      { word: 'ARBRE', count: 2 },
      { word: 'TABLE', count: 2 },
    ]);
  });

  it('limite le nombre de résultats', () => {
    const stats = recordGrids(emptyStats(), [grid(['UN', 'DEUX', 'TROIS', 'QUATRE'])]);
    expect(topWords(stats, 2)).toHaveLength(2);
  });

  it('retourne un tableau vide sans données', () => {
    expect(topWords(emptyStats())).toEqual([]);
  });
});
