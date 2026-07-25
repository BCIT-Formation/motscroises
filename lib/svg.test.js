/**
 * Tests unitaires de lib/svg.js — export SVG des grilles.
 */

import { describe, it, expect } from 'vitest'
import { crosswordToSvg } from './svg'
import { generateCrossword } from './crossword'

const WORDS = [
  { word: 'MAISON', clue: 'On y vit' },
  { word: 'SOLEIL', clue: 'Étoile' },
  { word: 'NUIT',   clue: 'Obscurité' },
]

describe('crosswordToSvg', () => {
  const result = generateCrossword(WORDS, 10)
  const whiteCells = result.grid.flat().filter((c) => c !== null).length
  const numberedCells = result.numbers.flat().filter((n) => n !== null).length

  it('produit un document SVG valide et autonome', () => {
    const svg = crosswordToSvg(result.grid, result.numbers)
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
    expect(svg).toMatch(/<\/svg>$/)
    expect(svg).toContain('<title>')
  })

  it('dessine une case par cellule de la bounding box (plus le fond)', () => {
    const svg = crosswordToSvg(result.grid, result.numbers)
    const rects = (svg.match(/<rect /g) || []).length
    expect(rects).toBeGreaterThanOrEqual(whiteCells + 1) // cases blanches + fond
  })

  it('numérote les cases de départ', () => {
    const svg = crosswordToSvg(result.grid, result.numbers)
    const numberTexts = (svg.match(/font-size="8"/g) || []).length
    expect(numberTexts).toBe(numberedCells)
  })

  it('masque les lettres par défaut (grille jouable)', () => {
    const svg = crosswordToSvg(result.grid, result.numbers)
    const letterTexts = (svg.match(/font-size="15"/g) || []).length
    expect(letterTexts).toBe(0)
  })

  it('affiche les lettres avec showLetters (grille solution)', () => {
    const svg = crosswordToSvg(result.grid, result.numbers, { showLetters: true })
    const letterTexts = (svg.match(/font-size="15"/g) || []).length
    expect(letterTexts).toBe(whiteCells)
  })

  it('échappe le titre pour produire du XML valide', () => {
    const svg = crosswordToSvg(result.grid, result.numbers, { title: 'Grille <n°1> & "co"' })
    expect(svg).toContain('Grille &lt;n°1&gt; &amp; &quot;co&quot;')
    expect(svg).not.toContain('<n°1>')
  })
})
