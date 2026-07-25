/**
 * Tests unitaires de lib/crossword.js — placement, numérotation, bounding box.
 */

import { describe, it, expect } from 'vitest'
import { generateCrossword, getBoundingBox, isGridConnected } from './crossword'
import { getWordsForDifficulty, getGridSize, getWordCount } from './words'

const SIZE = 10

/** Liste de mots avec beaucoup de lettres communes (placement garanti). */
const WORDS = [
  { word: 'MAISON', clue: 'On y vit' },
  { word: 'SOLEIL', clue: 'Étoile' },
  { word: 'NUIT',   clue: 'Obscurité' },
  { word: 'TABLE',  clue: 'Meuble' },
]

/** Retourne les lettres lues dans la grille aux coordonnées d'un mot placé. */
function readWordFromGrid(grid, pw) {
  let letters = ''
  for (let i = 0; i < pw.word.length; i++) {
    const r = pw.dir === 'across' ? pw.row : pw.row + i
    const c = pw.dir === 'across' ? pw.col + i : pw.col
    letters += grid[r][c] ? grid[r][c].letter : '?'
  }
  return letters
}

// ─── Placement ─────────────────────────────────────────────────────────────────

describe('generateCrossword — placement', () => {
  it('place le premier mot horizontalement au centre de la grille', () => {
    const { placedWords, size } = generateCrossword(WORDS, SIZE)
    const first = placedWords[0]
    expect(first.dir).toBe('across')
    expect(first.row).toBe(Math.floor(size / 2))
    expect(first.col).toBe(Math.floor((size - first.word.length) / 2))
  })

  it('écrit les lettres de chaque mot placé aux bonnes coordonnées', () => {
    const { grid, placedWords } = generateCrossword(WORDS, SIZE)
    expect(placedWords.length).toBeGreaterThan(0)
    for (const pw of placedWords) {
      expect(readWordFromGrid(grid, pw)).toBe(pw.word)
    }
  })

  it('chaque mot après le premier croise au moins un autre mot', () => {
    const { placedWords } = generateCrossword(WORDS, SIZE)
    expect(placedWords.length).toBeGreaterThanOrEqual(2)

    const cellsOf = (pw) => {
      const cells = []
      for (let i = 0; i < pw.word.length; i++) {
        cells.push(
          pw.dir === 'across' ? `${pw.row},${pw.col + i}` : `${pw.row + i},${pw.col}`
        )
      }
      return cells
    }

    for (let i = 1; i < placedWords.length; i++) {
      const mine = new Set(cellsOf(placedWords[i]))
      const others = placedWords
        .filter((_, j) => j !== i)
        .flatMap(cellsOf)
      const shared = others.filter((c) => mine.has(c))
      expect(shared.length).toBeGreaterThan(0)
    }
  })

  it('ne place pas un mot sans lettre commune avec la grille', () => {
    // PONT et FILM n'ont aucune lettre en commun → FILM est écarté
    const result = generateCrossword(
      [{ word: 'PONT', clue: 'x' }, { word: 'FILM', clue: 'y' }],
      SIZE
    )
    expect(result.placedWords.map((w) => w.word)).toEqual(['PONT'])
  })

  it('ne place pas un mot plus long que la grille', () => {
    const result = generateCrossword(
      [{ word: 'ANTICONSTITUTIONNELLEMENT', clue: 'x' }],
      SIZE
    )
    expect(result.placedWords).toHaveLength(0)
  })

  it('toutes les cases remplies appartiennent à au moins un mot placé', () => {
    const { grid, placedWords, size } = generateCrossword(WORDS, SIZE)
    const covered = new Set()
    for (const pw of placedWords) {
      for (let i = 0; i < pw.word.length; i++) {
        covered.add(
          pw.dir === 'across' ? `${pw.row},${pw.col + i}` : `${pw.row + i},${pw.col}`
        )
      }
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) {
          expect(covered.has(`${r},${c}`)).toBe(true)
        }
      }
    }
  })

  it('sépare correctement les indices horizontaux et verticaux', () => {
    const { placedWords, acrossClues, downClues } = generateCrossword(WORDS, SIZE)
    expect(acrossClues.length + downClues.length).toBe(placedWords.length)
    expect(acrossClues.length).toBe(
      placedWords.filter((w) => w.dir === 'across').length
    )
  })
})

// ─── Numérotation ──────────────────────────────────────────────────────────────

describe('generateCrossword — numérotation', () => {
  it('attribue un numéro à chaque mot placé', () => {
    const { placedWords } = generateCrossword(WORDS, SIZE)
    for (const pw of placedWords) {
      expect(pw.number).toBeGreaterThanOrEqual(1)
    }
  })

  it('numérote les cases dans l\'ordre de lecture (ligne par ligne), à partir de 1', () => {
    const { numbers, size } = generateCrossword(WORDS, SIZE)
    const seen = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (numbers[r][c] !== null) seen.push(numbers[r][c])
      }
    }
    expect(seen[0]).toBe(1)
    expect(seen).toEqual([...seen].sort((a, b) => a - b))
    // Numéros consécutifs sans trou
    expect(seen).toEqual(Array.from({ length: seen.length }, (_, i) => i + 1))
  })

  it('le numéro d\'un mot correspond à sa case de départ', () => {
    const { numbers, placedWords } = generateCrossword(WORDS, SIZE)
    for (const pw of placedWords) {
      expect(numbers[pw.row][pw.col]).toBe(pw.number)
    }
  })

  it('trie les listes d\'indices par numéro croissant', () => {
    const { acrossClues, downClues } = generateCrossword(WORDS, SIZE)
    const isSorted = (arr) =>
      arr.every((c, i) => i === 0 || arr[i - 1].number <= c.number)
    expect(isSorted(acrossClues)).toBe(true)
    expect(isSorted(downClues)).toBe(true)
  })

  it('deux mots partageant une case de départ partagent le même numéro', () => {
    const { numbers, placedWords } = generateCrossword(WORDS, SIZE)
    const byStart = new Map()
    for (const pw of placedWords) {
      const key = `${pw.row},${pw.col}`
      if (byStart.has(key)) {
        expect(pw.number).toBe(byStart.get(key))
      }
      byStart.set(key, pw.number)
      expect(numbers[pw.row][pw.col]).toBe(pw.number)
    }
  })
})

// ─── Connexité ─────────────────────────────────────────────────────────────────

describe('isGridConnected', () => {
  const emptyGrid = (n) =>
    Array.from({ length: n }, () => Array(n).fill(null))

  it('considère une grille vide comme connexe', () => {
    expect(isGridConnected(emptyGrid(5))).toBe(true)
  })

  it('considère un seul mot comme connexe', () => {
    const grid = emptyGrid(5)
    grid[2][1] = { letter: 'A' }
    grid[2][2] = { letter: 'B' }
    grid[2][3] = { letter: 'C' }
    expect(isGridConnected(grid)).toBe(true)
  })

  it('détecte deux blocs de lettres isolés', () => {
    const grid = emptyGrid(6)
    grid[0][0] = { letter: 'A' }
    grid[0][1] = { letter: 'B' }
    grid[5][5] = { letter: 'C' }
    expect(isGridConnected(grid)).toBe(false)
  })

  it('ne relie pas les cases en diagonale', () => {
    const grid = emptyGrid(4)
    grid[0][0] = { letter: 'A' }
    grid[1][1] = { letter: 'B' }
    expect(isGridConnected(grid)).toBe(false)
  })

  it('reconnaît une croix comme connexe', () => {
    const grid = emptyGrid(5)
    for (let i = 0; i < 5; i++) {
      grid[2][i] = { letter: 'X' }
      grid[i][2] = { letter: 'X' }
    }
    expect(isGridConnected(grid)).toBe(true)
  })

  it('les grilles générées sont toujours connexes (liste fixe)', () => {
    const { grid } = generateCrossword(WORDS, SIZE)
    expect(isGridConnected(grid)).toBe(true)
  })

  it('les grilles générées sont toujours connexes (tirages aléatoires, toutes difficultés)', () => {
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      for (let run = 0; run < 5; run++) {
        const wordList = getWordsForDifficulty(difficulty, getWordCount(difficulty) + 5)
        const { grid } = generateCrossword(wordList, getGridSize(difficulty))
        expect(isGridConnected(grid)).toBe(true)
      }
    }
  })
})

// ─── Bounding box ──────────────────────────────────────────────────────────────

describe('getBoundingBox', () => {
  const emptyGrid = (n) =>
    Array.from({ length: n }, () => Array(n).fill(null))

  it('retourne la grille entière si elle est vide', () => {
    expect(getBoundingBox(emptyGrid(5))).toEqual({
      minR: 0, maxR: 4, minC: 0, maxC: 4,
    })
  })

  it('rogne les bords vides autour des lettres', () => {
    const grid = emptyGrid(6)
    grid[2][1] = { letter: 'A' }
    grid[2][2] = { letter: 'B' }
    grid[4][2] = { letter: 'C' }
    expect(getBoundingBox(grid)).toEqual({
      minR: 2, maxR: 4, minC: 1, maxC: 2,
    })
  })

  it('gère une seule case remplie', () => {
    const grid = emptyGrid(4)
    grid[3][0] = { letter: 'Z' }
    expect(getBoundingBox(grid)).toEqual({
      minR: 3, maxR: 3, minC: 0, maxC: 0,
    })
  })

  it('couvre exactement les mots placés par generateCrossword', () => {
    const { grid, placedWords } = generateCrossword(WORDS, SIZE)
    const { minR, maxR, minC, maxC } = getBoundingBox(grid)
    for (const pw of placedWords) {
      for (let i = 0; i < pw.word.length; i++) {
        const r = pw.dir === 'across' ? pw.row : pw.row + i
        const c = pw.dir === 'across' ? pw.col + i : pw.col
        expect(r).toBeGreaterThanOrEqual(minR)
        expect(r).toBeLessThanOrEqual(maxR)
        expect(c).toBeGreaterThanOrEqual(minC)
        expect(c).toBeLessThanOrEqual(maxC)
      }
    }
  })
})
