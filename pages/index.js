/**
 * Mots Croisés — Application principale
 * Génération et export PDF côté client, sans dépendance externe.
 */

import Head from 'next/head'
import { useState, useCallback, useEffect, useRef } from 'react'
import { generateCrossword, getBoundingBox, isConnected } from '../lib/crossword'
import { getWordsForDifficulty, getGridSize, getWordCount, THEMES } from '../lib/words'

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

// ─── Génération d'une grille ───────────────────────────────────────────────────
const MIN_PLACED_WORDS = 3
const MAX_ATTEMPTS = 6

/**
 * Génère une grille pour une difficulté et un thème donnés.
 * Effectue plusieurs tentatives et garde la grille connexe qui place
 * le plus de mots. Retourne null si aucune tentative ne place au moins
 * MIN_PLACED_WORDS mots.
 */
function generateOneGrid(difficulty, theme) {
  const size = getGridSize(difficulty)
  const targetCount = getWordCount(difficulty)
  let best = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const wordList = getWordsForDifficulty(difficulty, targetCount + 5, theme) // +5 pour marge
    const result = generateCrossword(wordList, size)
    if (result.placedWords.length < MIN_PLACED_WORDS) continue
    if (!isConnected(result.grid)) continue
    if (!best || result.placedWords.length > best.placedWords.length) best = result
    if (best.placedWords.length >= targetCount) break
  }

  if (!best) return null
  return { ...best, difficulty, theme, wordCount: best.placedWords.length }
}

// ─── Préférences (localStorage) ────────────────────────────────────────────────
const PREFS_KEY = 'motscroises.prefs'

function loadPrefs() {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePrefs(prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Stockage indisponible (navigation privée…) : ignorer
  }
}

// ─── Composant Grille ──────────────────────────────────────────────────────────
function CrosswordGrid({ data, index, onRegenerate }) {
  const { grid, numbers, acrossClues, downClues, size } = data
  const { minR, maxR, minC, maxC } = getBoundingBox(grid)

  return (
    <div className="crossword-card">
      <div className="crossword-card-header">
        <h2>Grille n°{index + 1}</h2>
        <div className="crossword-card-actions">
          <span className="meta">
            Difficulté {data.difficulty} · {data.wordCount} mots · {size}×{size}
          </span>
          <button
            className="btn btn-secondary btn-small"
            onClick={onRegenerate}
            title="Régénérer uniquement cette grille"
          >
            ↻ Régénérer
          </button>
        </div>
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

// ─── Feuille de solutions (impression) ─────────────────────────────────────────
function SolutionsSheet({ grids }) {
  return (
    <section className="solutions-print">
      <h2 className="solutions-title">Solutions</h2>
      <div className="solutions-list">
        {grids.map((data, i) => {
          const { grid } = data
          const { minR, maxR, minC, maxC } = getBoundingBox(grid)
          return (
            <div className="solution-item" key={i}>
              <h3>Grille n°{i + 1}</h3>
              <table className="crossword-grid solution-grid" aria-label={`Solution de la grille ${i + 1}`}>
                <tbody>
                  {Array.from({ length: maxR - minR + 1 }, (_, ri) => {
                    const r = ri + minR
                    return (
                      <tr key={r}>
                        {Array.from({ length: maxC - minC + 1 }, (_, ci) => {
                          const c = ci + minC
                          const cell = grid[r][c]
                          const isBlack = cell === null
                          return (
                            <td key={c} className={isBlack ? 'black' : 'white'}>
                              {!isBlack && <span className="cell-letter">{cell.letter}</span>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </section>
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
  const [showSolutions,  setShowSolutions]  = useState(false)
  const [printSolutions, setPrintSolutions] = useState(false)
  const [prefsLoaded,    setPrefsLoaded]    = useState(false)
  const contentRef = useRef(null)

  // ─── Charger puis sauvegarder les préférences ───────────────────────────────
  useEffect(() => {
    const prefs = loadPrefs()
    if (prefs) {
      if (Number.isInteger(prefs.difficulty) && prefs.difficulty >= 1 && prefs.difficulty <= 10) {
        setDifficulty(prefs.difficulty)
      }
      if (Number.isInteger(prefs.gridCount) && prefs.gridCount >= 1 && prefs.gridCount <= 99) {
        setGridCount(prefs.gridCount)
      }
      if (THEMES.some((t) => t.id === prefs.theme)) {
        setTheme(prefs.theme)
      }
      if (typeof prefs.printSolutions === 'boolean') {
        setPrintSolutions(prefs.printSolutions)
      }
    }
    setPrefsLoaded(true)
  }, [])

  useEffect(() => {
    if (!prefsLoaded) return
    savePrefs({ difficulty, gridCount, theme, printSolutions })
  }, [prefsLoaded, difficulty, gridCount, theme, printSolutions])

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
    setError(null)

    const count   = Math.min(99, Math.max(1, gridCount))
    const results = []
    let failures  = 0

    // Utiliser setTimeout pour ne pas bloquer le rendu entre chaque grille
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const result = generateOneGrid(difficulty, theme)
      if (result) {
        results.push(result)
      } else {
        failures++
      }

      setProgress(Math.round(((i + 1) / count) * 100))
    }

    setGrids(results)
    setIsGenerating(false)

    if (results.length === 0) {
      setError(
        'Impossible de générer une grille : trop peu de mots ont pu être placés. ' +
        'Essayez une autre difficulté ou un autre thème.'
      )
    } else if (failures > 0) {
      showToast(
        `${results.length} grille${results.length > 1 ? 's' : ''} générée${results.length > 1 ? 's' : ''} · ` +
        `${failures} échec${failures > 1 ? 's' : ''} (trop peu de mots placés)`
      )
    } else {
      showToast(`${count} grille${count > 1 ? 's' : ''} générée${count > 1 ? 's' : ''} !`)
    }
  }, [difficulty, gridCount, theme, isGenerating, showToast])

  // ─── Régénérer une seule grille ──────────────────────────────────────────────
  const handleRegenerate = useCallback((index) => {
    const current = grids[index]
    if (!current) return

    const result = generateOneGrid(current.difficulty, current.theme ?? 'tous')
    if (!result) {
      showToast('Échec de la régénération : trop peu de mots placés. Réessayez.')
      return
    }

    setGrids((prev) => prev.map((g, i) => (i === index ? result : g)))
    showToast(`Grille n°${index + 1} régénérée !`)
  }, [grids, showToast])

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

            {/* Thème */}
            <div className="control-group">
              <label>Thème</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Thème des mots"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <div className="stats">Filtre la banque de mots par catégorie</div>
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

            {/* Voir / masquer les solutions à l'écran */}
            <button
              className="btn btn-secondary"
              onClick={() => setShowSolutions((s) => !s)}
              disabled={grids.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {showSolutions ? 'Masquer les solutions' : 'Voir les solutions'}
            </button>

            {/* Solutions à l'impression */}
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={printSolutions}
                onChange={(e) => setPrintSolutions(e.target.checked)}
              />
              Imprimer les solutions à part
            </label>

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
          <div className={`content${showSolutions ? ' show-solutions' : ''}`} ref={contentRef}>
            {error && grids.length === 0 && !isGenerating && (
              <div className="error-banner" role="alert">
                <strong>Génération impossible.</strong> {error}
              </div>
            )}
            {grids.length === 0 && !isGenerating && !error ? (
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
              grids.map((g, i) => (
                <CrosswordGrid key={i} data={g} index={i} onRegenerate={() => handleRegenerate(i)} />
              ))
            )}
            {grids.length > 0 && printSolutions && <SolutionsSheet grids={grids} />}
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
