/**
 * Mots Croisés — Application principale
 * Génération et export PDF côté client, sans dépendance externe.
 */

import Head from 'next/head'
import { useState, useCallback, useRef } from 'react'
import { generateCrossword, getBoundingBox } from '../lib/crossword'
import { getWordsForDifficulty, getGridSize, getWordCount } from '../lib/words'

// ─── Labels de difficulté ──────────────────────────────────────────────────────
const DIFF_LABELS = {
  1: 'Très facile', 2: 'Facile',
  3: 'Facile+',     4: 'Moyen-',
  5: 'Moyen',       6: 'Moyen+',
  7: 'Difficile-',  8: 'Difficile',
  9: 'Expert-',    10: 'Expert',
}

const DIFF_DESC = {
  1: 'Grille 10×10 · ~8 mots · vocabulaire courant',
  2: 'Grille 10×10 · ~8 mots · vocabulaire courant',
  3: 'Grille 11×11 · ~11 mots · vocabulaire usuel',
  4: 'Grille 11×11 · ~11 mots · vocabulaire usuel',
  5: 'Grille 13×13 · ~14 mots · vocabulaire intermédiaire',
  6: 'Grille 13×13 · ~14 mots · vocabulaire intermédiaire',
  7: 'Grille 15×15 · ~18 mots · vocabulaire avancé',
  8: 'Grille 15×15 · ~18 mots · vocabulaire avancé',
  9: 'Grille 15×15 · ~22 mots · vocabulaire expert',
 10: 'Grille 15×15 · ~22 mots · vocabulaire expert',
}

// ─── Composant Grille ──────────────────────────────────────────────────────────
function CrosswordGrid({ data, index }) {
  const { grid, numbers, acrossClues, downClues, size } = data
  const { minR, maxR, minC, maxC } = getBoundingBox(grid)

  return (
    <div className="crossword-card">
      <div className="crossword-card-header">
        <h2>Grille n°{index + 1}</h2>
        <span className="meta">
          Difficulté {data.difficulty} · {data.wordCount} mots · {size}×{size}
        </span>
      </div>

      <div className="grid-and-clues">
        {/* Tableau de la grille */}
        <div className="grid-wrapper">
          <table className="crossword-grid" aria-label={`Grille de mots croisés ${index + 1}`}>
            <tbody>
              {Array.from({ length: maxR - minR + 1 }, (_, ri) => {
                const r = ri + minR
                return (
                  <tr key={r}>
                    {Array.from({ length: maxC - minC + 1 }, (_, ci) => {
                      const c = ci + minC
                      const cell = grid[r][c]
                      const num  = numbers[r][c]
                      const isBlack = cell === null

                      return (
                        <td key={c} className={isBlack ? 'black' : 'white'}>
                          {!isBlack && (
                            <>
                              {num && <span className="cell-number">{num}</span>}
                              <span className="cell-letter">{cell.letter}</span>
                            </>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Indices */}
        <div className="clues-section">
          {acrossClues.length > 0 && (
            <div className="clues-col">
              <h3>→ Horizontalement</h3>
              {acrossClues.map((c) => (
                <div className="clue-item" key={`a-${c.number}`}>
                  <span className="clue-num">{c.number}.</span>
                  <span>{c.clue}</span>
                </div>
              ))}
            </div>
          )}
          {downClues.length > 0 && (
            <div className="clues-col">
              <h3>↓ Verticalement</h3>
              {downClues.map((c) => (
                <div className="clue-item" key={`d-${c.number}`}>
                  <span className="clue-num">{c.number}.</span>
                  <span>{c.clue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Home() {
  const [difficulty,   setDifficulty]   = useState(5)
  const [gridCount,    setGridCount]    = useState(1)
  const [grids,        setGrids]        = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast,        setToast]        = useState(null)
  const [progress,     setProgress]     = useState(0)
  const contentRef = useRef(null)

  // ─── Afficher un message temporaire ─────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ─── Générer les grilles ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setProgress(0)
    setGrids([])

    const count   = Math.min(99, Math.max(1, gridCount))
    const results = []

    // Utiliser setTimeout pour ne pas bloquer le rendu entre chaque grille
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const size      = getGridSize(difficulty)
      const wordCount = getWordCount(difficulty)
      const wordList  = getWordsForDifficulty(difficulty, wordCount + 5) // +5 pour marge

      const result = generateCrossword(wordList, size)
      results.push({
        ...result,
        difficulty,
        wordCount: result.placedWords.length,
      })

      setProgress(Math.round(((i + 1) / count) * 100))
    }

    setGrids(results)
    setIsGenerating(false)
    showToast(`${count} grille${count > 1 ? 's' : ''} générée${count > 1 ? 's' : ''} !`)
  }, [difficulty, gridCount, isGenerating, showToast])

  // ─── Export PDF via impression navigateur ────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (grids.length === 0) {
      showToast('Générez d\'abord des grilles.')
      return
    }
    window.print()
  }, [grids, showToast])

  // ─── Contrôle du nombre de grilles ───────────────────────────────────────────
  const handleCountChange = (e) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) setGridCount(Math.min(99, Math.max(1, v)))
  }

  return (
    <>
      <Head>
        <title>Mots Croisés – Générateur</title>
        <meta name="description" content="Générateur de grilles de mots croisés français, exportable en PDF." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app">
        {/* ── En-tête ── */}
        <header>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <div>
            <h1>Mots Croisés</h1>
            <div className="subtitle">Générateur de grilles — 100 % local, sans internet</div>
          </div>
        </header>

        <main>
          {/* ── Barre latérale de contrôles ── */}
          <aside className="sidebar">

            {/* Difficulté */}
            <div className="control-group">
              <label>Difficulté</label>
              <div className="value-display">{difficulty}</div>
              <input
                type="range"
                min={1} max={10} step={1}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
              />
              <div className="diff-labels"><span>1 · Facile</span><span>10 · Expert</span></div>
              <div className={`difficulty-badge diff-${difficulty}`}>
                {DIFF_LABELS[difficulty]}
              </div>
              <div className="stats">{DIFF_DESC[difficulty]}</div>
            </div>

            {/* Nombre de grilles */}
            <div className="control-group">
              <label>Nombre de grilles</label>
              <input
                type="number"
                min={1} max={99}
                value={gridCount}
                onChange={handleCountChange}
              />
              <div className="stats">Entre 1 et 99 grilles</div>
            </div>

            {/* Bouton générer */}
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating
                ? <><span className="spinner" />{`Génération… ${progress}%`}</>
                : <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Générer {gridCount > 1 ? `${gridCount} grilles` : 'la grille'}
                  </>
              }
            </button>

            {/* Barre de progression */}
            {isGenerating && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}

            {/* Bouton PDF */}
            <button
              className="btn btn-success"
              onClick={handlePrint}
              disabled={grids.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9V2h12v7"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Exporter en PDF ({grids.length})
            </button>

            {grids.length > 0 && (
              <div className="stats">
                {grids.length} grille{grids.length > 1 ? 's' : ''} · difficulté {difficulty} · prêtes à imprimer
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Info hors-ligne */}
            <div className="stats" style={{ fontSize: '.72rem', lineHeight: 1.5 }}>
              ✓ Fonctionne sans internet<br />
              ✓ Aucune donnée envoyée<br />
              ✓ PDF via impression navigateur
            </div>
          </aside>

          {/* ── Zone principale ── */}
          <div className="content" ref={contentRef}>
            {grids.length === 0 && !isGenerating ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <h2>Aucune grille générée</h2>
                <p>
                  Choisissez une difficulté, un nombre de grilles,
                  puis cliquez sur <strong>Générer</strong>.
                </p>
                <p style={{ marginTop: '-.25rem' }}>
                  Exportez ensuite en PDF pour l'impression.
                </p>
              </div>
            ) : (
              grids.map((g, i) => (
                <CrosswordGrid key={i} data={g} index={i} />
              ))
            )}
          </div>
        </main>

        <footer>
          Mots Croisés · Générateur client — aucune donnée transmise · Exportez via Ctrl+P ou le bouton PDF
        </footer>
      </div>

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
