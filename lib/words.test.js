/**
 * Tests unitaires de lib/words.js — filtrage par difficulté et intégrité de la banque.
 */

import { describe, it, expect } from 'vitest'
import {
  WORD_BANK,
  THEMES,
  getWordsForDifficulty,
  getGridSize,
  getWordCount,
} from './words'

// ─── Intégrité de la banque de mots ───────────────────────────────────────────

describe('WORD_BANK', () => {
  it('contient au moins 500 mots', () => {
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(500)
  })

  it('ne contient aucun doublon', () => {
    const words = WORD_BANK.map((w) => w.word)
    const dupes = words.filter((w, i) => words.indexOf(w) !== i)
    expect(dupes).toEqual([])
  })

  it('chaque mot est en majuscules A-Z sans accent (compatible grille)', () => {
    for (const w of WORD_BANK) {
      expect(w.word).toMatch(/^[A-Z]{3,}$/)
    }
  })

  it('chaque entrée a un indice, un niveau 1-10 et une catégorie', () => {
    for (const w of WORD_BANK) {
      expect(w.clue.length).toBeGreaterThan(0)
      expect(w.level).toBeGreaterThanOrEqual(1)
      expect(w.level).toBeLessThanOrEqual(10)
      expect(w.cat.length).toBeGreaterThan(0)
    }
  })

  it('offre suffisamment de mots pour chaque niveau de difficulté', () => {
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      const pool = getWordsForDifficulty(difficulty, Infinity)
      // Marge confortable au-dessus du nombre de mots cible (+5 utilisé par l'UI)
      expect(pool.length).toBeGreaterThanOrEqual(getWordCount(difficulty) + 5)
    }
  })
})

// ─── Filtrage par difficulté ───────────────────────────────────────────────────

describe('getWordsForDifficulty', () => {
  const EXPECTED_RANGES = [
    { difficulty: 1,  min: 1, max: 2 },
    { difficulty: 2,  min: 1, max: 2 },
    { difficulty: 3,  min: 1, max: 4 },
    { difficulty: 4,  min: 1, max: 4 },
    { difficulty: 5,  min: 3, max: 6 },
    { difficulty: 6,  min: 3, max: 6 },
    { difficulty: 7,  min: 5, max: 8 },
    { difficulty: 8,  min: 5, max: 8 },
    { difficulty: 9,  min: 7, max: 10 },
    { difficulty: 10, min: 7, max: 10 },
  ]

  for (const { difficulty, min, max } of EXPECTED_RANGES) {
    it(`difficulté ${difficulty} → ne retourne que des mots de niveau ${min} à ${max}`, () => {
      const words = getWordsForDifficulty(difficulty, 200)
      expect(words.length).toBeGreaterThan(0)
      for (const w of words) {
        expect(w.level).toBeGreaterThanOrEqual(min)
        expect(w.level).toBeLessThanOrEqual(max)
      }
    })
  }

  it('respecte le nombre de mots demandé', () => {
    expect(getWordsForDifficulty(5, 7)).toHaveLength(7)
    expect(getWordsForDifficulty(5, 1)).toHaveLength(1)
  })

  it('retourne tout le pool si count dépasse le nombre de mots disponibles', () => {
    const all = getWordsForDifficulty(1, 100000)
    expect(all.length).toBeLessThanOrEqual(WORD_BANK.length)
    expect(all.length).toBeGreaterThan(0)
  })

  it('ne retourne jamais deux fois le même mot', () => {
    for (let i = 0; i < 10; i++) {
      const words = getWordsForDifficulty(5, 200).map((w) => w.word)
      expect(new Set(words).size).toBe(words.length)
    }
  })

  it('exclut les mots de moins de 3 lettres', () => {
    const words = getWordsForDifficulty(1, 100000)
    for (const w of words) {
      expect(w.word.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('retourne des objets { word, clue } utilisables par le générateur', () => {
    const [first] = getWordsForDifficulty(5, 1)
    expect(typeof first.word).toBe('string')
    expect(typeof first.clue).toBe('string')
  })
})

// ─── Thèmes ────────────────────────────────────────────────────────────────────

describe('THEMES', () => {
  it('contient le thème par défaut « tous » sans restriction de catégorie', () => {
    expect(THEMES.tous).toBeDefined()
    expect(THEMES.tous.cats).toBeNull()
  })

  it('chaque thème a un libellé et des catégories existantes dans la banque', () => {
    const bankCats = new Set(WORD_BANK.map((w) => w.cat))
    for (const [key, t] of Object.entries(THEMES)) {
      expect(t.label.length).toBeGreaterThan(0)
      if (key === 'tous') continue
      expect(t.cats.length).toBeGreaterThan(0)
      for (const cat of t.cats) {
        expect(bankCats.has(cat), `catégorie inconnue « ${cat} » dans le thème « ${key} »`).toBe(true)
      }
    }
  })
})

describe('getWordsForDifficulty — filtrage par thème', () => {
  it('ne retourne que des mots des catégories du thème', () => {
    for (const [key, t] of Object.entries(THEMES)) {
      if (key === 'tous') continue
      const words = getWordsForDifficulty(3, 20, key)
      expect(words.length).toBeGreaterThan(0)
      for (const w of words) {
        expect(t.cats).toContain(w.cat)
      }
    }
  })

  it('« tous » se comporte comme l\'absence de thème', () => {
    const words = getWordsForDifficulty(5, 200, 'tous')
    const noTheme = getWordsForDifficulty(5, 200)
    expect(new Set(words.map((w) => w.cat)).size).toBeGreaterThan(1)
    expect(words.length).toBe(noTheme.length)
  })

  it('un thème inconnu retombe sur « tous »', () => {
    const words = getWordsForDifficulty(5, 50, 'inexistant')
    expect(words.length).toBe(getWordsForDifficulty(5, 50).length)
  })

  it('élargit la plage de niveaux si le thème est trop pauvre dans la plage demandée', () => {
    // Il n'existe presque pas de mots « animaux » de niveau 7-10 :
    // le tirage doit puiser dans tout le thème plutôt que d'échouer.
    const words = getWordsForDifficulty(10, 15, 'animaux')
    expect(words.length).toBeGreaterThanOrEqual(15)
    for (const w of words) {
      expect(w.cat).toBe('animaux')
    }
  })

  it('chaque thème fournit assez de mots pour générer une grille à toute difficulté', () => {
    for (const key of Object.keys(THEMES)) {
      for (let difficulty = 1; difficulty <= 10; difficulty++) {
        const words = getWordsForDifficulty(difficulty, getWordCount(difficulty) + 5, key)
        expect(
          words.length,
          `thème « ${key} », difficulté ${difficulty}`
        ).toBeGreaterThanOrEqual(getWordCount(difficulty) + 5)
      }
    }
  })
})

// ─── Paramètres de grille ──────────────────────────────────────────────────────

describe('getGridSize', () => {
  it('croît avec la difficulté', () => {
    expect(getGridSize(1)).toBe(10)
    expect(getGridSize(2)).toBe(10)
    expect(getGridSize(3)).toBe(11)
    expect(getGridSize(4)).toBe(11)
    expect(getGridSize(5)).toBe(13)
    expect(getGridSize(6)).toBe(13)
    expect(getGridSize(7)).toBe(15)
    expect(getGridSize(8)).toBe(15)
    expect(getGridSize(9)).toBe(15)
    expect(getGridSize(10)).toBe(15)
  })
})

describe('getWordCount', () => {
  it('croît avec la difficulté', () => {
    expect(getWordCount(1)).toBe(8)
    expect(getWordCount(3)).toBe(11)
    expect(getWordCount(5)).toBe(14)
    expect(getWordCount(7)).toBe(18)
    expect(getWordCount(9)).toBe(22)
  })
})
