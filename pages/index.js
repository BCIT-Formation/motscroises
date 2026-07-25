/**
 * Mots Croisés — Application principale
 * Génération et export PDF côté client, sans dépendance externe.
 */

import Head from 'next/head'
import { useState, useCallback, useEffect, useRef } from 'react'
import { generateCrossword, getBoundingBox, isGridConnected } from '../lib/crossword'
import { getWordsForDifficulty, getGridSize, getWordCount, THEMES } from '../lib/words'

// Une grille avec moins de 3 mots placés est considérée comme ratée.
const MIN_PLACED_WORDS = 3
// Nombre de tirages de mots tentés avant d'abandonner une grille.
const MAX_ATTEMPTS_PER_GRID = 5
// Clé localStorage des préférences (difficulté, nb grilles, thème).
const PREFS_KEY = 'motscroises:prefs'

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
function CrosswordGrid({ data, index, onRegenerate }) {
  const { grid, numbers, acrossClues, downClues, size } = data
  const { minR, maxR, minC, maxC } = getBoundingBox(grid)
  // Les lettres sont masquées à l'écran par défaut : la grille est jouable.
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className="crossword-card">
      <div className="crossword-card-header">
        <h2>Grille n°{index + 1}</h2>
        <div className="card-actions">
          <button
            type="button"
            className="btn btn-small"
            onClick={() => setShowSolution((s) => !s)}
            aria-pressed={showSolution}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
              {showSolution && <line x1="3" y1="21" x2="21" y2="3"/>}
            </svg>
            {showSolution ? 'Masquer la solution' : 'Voir la solution'}
          </button>
          <button
            type="button"
            className="btn btn-small"
            onClick={() => onRegenerate(index)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Régénérer
          </button>
        </div>
        <span className="meta">
          Difficulté {data.difficulty} · {THEMES[data.theme]?.label ?? 'Tous les thèmes'} · {data.wordCount} mots · {size}×{size}
        </span>
      </div>

      <div className="grid-and-clues">
        {/* Tableau de la grille */}
        <div className="grid-wrapper">
          <table
            className={`crossword-grid${showSolution ? '' : ' letters-masked'}`}
            aria-label={`Grille de mots croisés ${index + 1}`}
          >
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

// ─── Composant Solution ────────────────────────────────────────────────────────
// Grille avec les lettres visibles, imprimable séparément des grilles à jouer.
function SolutionGrid({ data, index }) {
  const { grid, numbers, size } = data
  const { minR, maxR, minC, maxC } = getBoundingBox(grid)

  return (
    <div className="crossword-card solution-card">
      <div className="crossword-card-header">
        <h2>Solution — Grille n°{index + 1}</h2>
        <span className="meta">
          Difficulté {data.difficulty} · {data.wordCount} mots · {size}×{size}
        </span>
      </div>

      <div className="grid-wrapper">
        <table className="crossword-grid" aria-label={`Solution de la grille ${index + 1}`}>
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
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Home() {
  const [difficulty,   setDifficulty]   = useState(5)
  const [gridCount,    setGridCount]    = useState(1)
  const [theme,        setTheme]        = useState('tous')
  const [grids,        setGrids]        = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast,        setToast]        = useState(null)
  const [progress,     setProgress]     = useState(0)
  const [error,        setError]        = useState(null)
  const [printTarget,  setPrintTarget]  = useState('grids')
  const contentRef = useRef(null)
  const prefsLoaded = useRef(false)
  const nextGridId  = useRef(1)

  // ─── Préférences persistées dans localStorage ────────────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null')
      if (saved) {
        if (Number.isInteger(saved.difficulty) && saved.difficulty >= 1 && saved.difficulty <= 10) {
          setDifficulty(saved.difficulty)
        }
        if (Number.isInteger(saved.gridCount) && saved.gridCount >= 1 && saved.gridCount <= 99) {
          setGridCount(saved.gridCount)
        }
        if (typeof saved.theme === 'string' && THEMES[saved.theme]) {
          setTheme(saved.theme)
        }
      }
    } catch {
      // Stockage indisponible ou corrompu : ignorer, les défauts s'appliquent
    }
    prefsLoaded.current = true
  }, [])

  useEffect(() => {
    if (!prefsLoaded.current) return
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ difficulty, gridCount, theme }))
    } catch {
      // Stockage indisponible (navigation privée…) : ignorer
    }
  }, [difficulty, gridCount, theme])

  // ─── Afficher un message temporaire ─────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ─── Générer une seule grille (avec retentatives) ────────────────────────────
  const generateOne = useCallback((diff, th) => {
    const size      = getGridSize(diff)
    const wordCount = getWordCount(diff)

    // Retenter avec un nouveau tirage de mots si trop peu sont placés
    // ou si la grille n'est pas connexe
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_GRID; attempt++) {
      const wordList  = getWordsForDifficulty(diff, wordCount + 5, th) // +5 pour marge
      const candidate = generateCrossword(wordList, size)
      if (
        candidate.placedWords.length >= MIN_PLACED_WORDS &&
        isGridConnected(candidate.grid)
      ) {
        return {
          ...candidate,
          id: nextGridId.current++,
          difficulty: diff,
          theme: th,
          wordCount: candidate.placedWords.length,
        }
      }
    }
    return null
  }, [])

  // ─── Générer les grilles ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return
    setIsGenerating(true)
    setProgress(0)
    setGrids([])
    setError(null)

    const count   = Math.min(99, Math.max(1, gridCount))
    const results = []
    let   failed  = 0

    // Utiliser setTimeout pour ne pas bloquer le rendu entre chaque grille
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const result = generateOne(difficulty, theme)
      if (result) {
        results.push(result)
      } else {
        failed++
      }

      setProgress(Math.round(((i + 1) / count) * 100))
    }

    setGrids(results)
    setIsGenerating(false)

    if (failed > 0) {
      setError(
        results.length === 0
          ? `Impossible de générer une grille : moins de ${MIN_PLACED_WORDS} mots ont pu être placés. Essayez une autre difficulté.`
          : `${failed} grille${failed > 1 ? 's' : ''} sur ${count} n'${failed > 1 ? 'ont' : 'a'} pas pu être générée${failed > 1 ? 's' : ''} (moins de ${MIN_PLACED_WORDS} mots placés).`
      )
    }
    if (results.length > 0) {
      showToast(`${results.length} grille${results.length > 1 ? 's' : ''} générée${results.length > 1 ? 's' : ''} !`)
    }
  }, [difficulty, gridCount, theme, isGenerating, generateOne, showToast])

  // ─── Régénérer une seule grille sans toucher aux autres ─────────────────────
  const handleRegenerate = useCallback((index) => {
    const current = grids[index]
    if (!current) return

    const fresh = generateOne(current.difficulty, current.theme)
    if (!fresh) {
      showToast(`Impossible de régénérer la grille n°${index + 1}. Réessayez.`)
      return
    }
    setGrids((prev) => prev.map((g, i) => (i === index ? fresh : g)))
    showToast(`Grille n°${index + 1} régénérée !`)
  }, [grids, generateOne, showToast])

  // ─── Export PDF via impression navigateur ────────────────────────────────────
  const handlePrint = useCallback(() => {
    if (grids.length === 0) {
      showToast('Générez d\'abord des grilles.')
      return
    }
    window.print()
  }, [grids, showToast])

  // ─── Impression séparée des solutions ────────────────────────────────────────
  const handlePrintSolutions = useCallback(() => {
    if (grids.length === 0) {
      showToast('Générez d\'abord des grilles.')
      return
    }
    setPrintTarget('solutions')
  }, [grids, showToast])

  // Attendre que le mode "solutions" soit rendu avant d'ouvrir l'impression
  useEffect(() => {
    if (printTarget !== 'solutions') return
    const timer = setTimeout(() => {
      window.print()
      setPrintTarget('grids')
    }, 50)
    return () => clearTimeout(timer)
  }, [printTarget])

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

      <div className="app" data-print={printTarget}>
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

            {/* Thème */}
            <div className="control-group">
              <label htmlFor="theme-select">Thème</label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {Object.entries(THEMES).map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
              </select>
              <div className="stats">Vocabulaire limité au thème choisi</div>
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

            {/* Bouton solutions */}
            <button
              className="btn btn-secondary"
              onClick={handlePrintSolutions}
              disabled={grids.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Imprimer les solutions
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
            {/* Message d'erreur de génération */}
            {error && (
              <div className="error-banner" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

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
                  Exportez ensuite en PDF pour l&apos;impression.
                </p>
              </div>
            ) : (
              <>
                {grids.map((g, i) => (
                  <CrosswordGrid key={g.id} data={g} index={i} onRegenerate={handleRegenerate} />
                ))}

                {/* Solutions — rendues uniquement pour l'impression séparée */}
                <section className="solutions-section" aria-hidden="true">
                  {grids.map((g, i) => (
                    <SolutionGrid key={g.id} data={g} index={i} />
                  ))}
                </section>
              </>
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
