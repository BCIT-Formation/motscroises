/**
 * Mots Croisés — Application principale
 * Génération et export PDF/SVG côté client, sans dépendance externe.
 */

import Head from 'next/head'
import { useState, useCallback, useEffect, useRef } from 'react'
import { generateCrossword, getBoundingBox, isConnected } from '../lib/crossword'
import { getWordsForDifficulty, getGridSize, getWordCount, THEMES, LANGS } from '../lib/words'
import { mulberry32, randomSeed } from '../lib/random'
import { crosswordToSVG } from '../lib/svg'
import { emptyStats, recordGrids, topWords, loadStats, saveStats } from '../lib/stats'

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

// ─── Apparence ─────────────────────────────────────────────────────────────────
const APPEARANCE_DEFAULTS = { cellSize: 32, font: 'mono', accent: '#2563eb' }

const FONT_STACKS = {
  mono:  '\'Courier New\', monospace',
  sans:  '\'Segoe UI\', system-ui, sans-serif',
  serif: 'Georgia, \'Times New Roman\', serif',
}

const FONT_LABELS = { mono: 'Machine à écrire', sans: 'Moderne', serif: 'Classique' }

/** Assombrit une couleur hexadécimale (#rrggbb) pour l'état hover. */
function darken(hex, amount = 0.15) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const f = (v) => Math.max(0, Math.round(v * (1 - amount)))
  const r = f((n >> 16) & 255)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// ─── Génération d'une grille ───────────────────────────────────────────────────
const MIN_PLACED_WORDS = 3
const MAX_ATTEMPTS = 6

/**
 * Génère une grille pour une difficulté, un thème et une langue donnés.
 * Effectue plusieurs tentatives et garde la grille connexe qui place
 * le plus de mots. Retourne null si aucune tentative ne place au moins
 * MIN_PLACED_WORDS mots.
 * Avec une graine (`seed`), la génération est déterministe : même graine,
 * même grille. C'est la base du partage par URL.
 */
function generateOneGrid(difficulty, theme, lang = 'fr', seed = null) {
  const size = getGridSize(difficulty)
  const targetCount = getWordCount(difficulty)
  const rng = seed !== null ? mulberry32(seed) : Math.random
  let best = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const wordList = getWordsForDifficulty(difficulty, targetCount + 5, theme, lang, rng) // +5 pour marge
    const result = generateCrossword(wordList, size)
    if (result.placedWords.length < MIN_PLACED_WORDS) continue
    if (!isConnected(result.grid)) continue
    if (!best || result.placedWords.length > best.placedWords.length) best = result
    if (best.placedWords.length >= targetCount) break
  }

  if (!best) return null
  return { ...best, difficulty, theme, lang, seed, wordCount: best.placedWords.length }
}

// ─── Partage par URL ───────────────────────────────────────────────────────────
/**
 * Analyse les paramètres de partage (?d=5&t=animaux&l=fr&s=123,456).
 * Retourne null si l'URL ne contient pas de partage valide.
 */
function parseShareParams(search) {
  const params = new URLSearchParams(search)
  if (!params.has('s')) return null

  const seeds = params
    .get('s')
    .split(',')
    .map((x) => parseInt(x, 10))
    .filter((n) => Number.isInteger(n) && n >= 0)
  if (seeds.length === 0 || seeds.length > 99) return null

  const d = parseInt(params.get('d'), 10)
  const difficulty = Number.isInteger(d) && d >= 1 && d <= 10 ? d : 5
  const t = params.get('t')
  const theme = THEMES.some((th) => th.id === t) ? t : 'tous'
  const lang = params.get('l') === 'en' ? 'en' : 'fr'

  return { difficulty, theme, lang, seeds }
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
function CrosswordGrid({ data, index, interactive, onRegenerate }) {
  const { grid, numbers, acrossClues, downClues, size } = data
  const { minR, maxR, minC, maxC } = getBoundingBox(grid)

  // Saisie interactive : lettres entrées par l'utilisateur, résultat de vérification.
  // La carte est montée avec une `key` liée à la graine de la grille : toute
  // régénération remonte le composant et réinitialise donc la saisie.
  const [entries, setEntries] = useState({})
  const [checkResult, setCheckResult] = useState(null)

  const handleInput = (r, c) => (e) => {
    const letter = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1)
    setEntries((prev) => ({ ...prev, [`${r},${c}`]: letter }))
    setCheckResult(null)
  }

  const handleVerify = () => {
    let total = 0
    let correct = 0
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (grid[r][c] === null) continue
        total++
        if (entries[`${r},${c}`] === grid[r][c].letter) correct++
      }
    }
    setCheckResult({ correct, total })
  }

  return (
    <div className="crossword-card">
      <div className="crossword-card-header">
        <h2>Grille n°{index + 1}</h2>
        <div className="crossword-card-actions">
          <span className="meta">
            Difficulté {data.difficulty} · {data.wordCount} mots · {size}×{size}
          </span>
          {interactive && (
            <>
              {checkResult && (
                <span
                  className={`verify-result ${checkResult.correct === checkResult.total ? 'all-correct' : ''}`}
                  role="status"
                >
                  {checkResult.correct}/{checkResult.total} lettres
                </span>
              )}
              <button
                className="btn btn-secondary btn-small"
                onClick={handleVerify}
                title="Vérifier les lettres saisies"
              >
                ✓ Vérifier
              </button>
            </>
          )}
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
                      const entry = entries[`${r},${c}`] || ''

                      let cls = isBlack ? 'black' : 'white'
                      if (!isBlack && checkResult && entry) {
                        cls += entry === cell.letter ? ' cell-correct' : ' cell-wrong'
                      }

                      return (
                        <td key={c} className={cls}>
                          {!isBlack && (
                            <>
                              {num && <span className="cell-number">{num}</span>}
                              <span className="cell-letter">{cell.letter}</span>
                              {interactive && (
                                <input
                                  className="cell-input"
                                  type="text"
                                  inputMode="text"
                                  autoComplete="off"
                                  maxLength={2}
                                  value={entry}
                                  onChange={handleInput(r, c)}
                                  aria-label={`Case ligne ${r + 1}, colonne ${c + 1}`}
                                />
                              )}
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
  const [lang,         setLang]         = useState('fr')
  const [grids,        setGrids]        = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast,        setToast]        = useState(null)
  const [progress,     setProgress]     = useState(0)
  const [error,        setError]        = useState(null)
  const [showSolutions,  setShowSolutions]  = useState(false)
  const [printSolutions, setPrintSolutions] = useState(false)
  const [interactive,    setInteractive]    = useState(false)
  const [darkMode,       setDarkMode]       = useState(null)
  const [cellSize,       setCellSize]       = useState(APPEARANCE_DEFAULTS.cellSize)
  const [font,           setFont]           = useState(APPEARANCE_DEFAULTS.font)
  const [accent,         setAccent]         = useState(APPEARANCE_DEFAULTS.accent)
  const [stats,          setStats]          = useState(() => emptyStats())
  const [prefsLoaded,    setPrefsLoaded]    = useState(false)
  const contentRef = useRef(null)
  const toastTimer = useRef(null)

  // ─── Afficher un message temporaire ─────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg)
    // Annuler le minuteur précédent : sans cela, un ancien toast encore
    // affiché ferait disparaître prématurément le nouveau message.
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  // ─── Cœur de la génération (piloté par des graines explicites) ──────────────
  const runGeneration = useCallback(async ({ difficulty, theme, lang, seeds }) => {
    setIsGenerating(true)
    setProgress(0)
    setGrids([])
    setError(null)

    const results = []
    let failures  = 0

    // Utiliser setTimeout pour ne pas bloquer le rendu entre chaque grille
    for (let i = 0; i < seeds.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0))

      const result = generateOneGrid(difficulty, theme, lang, seeds[i])
      if (result) {
        results.push(result)
      } else {
        failures++
      }

      setProgress(Math.round(((i + 1) / seeds.length) * 100))
    }

    setGrids(results)
    setIsGenerating(false)

    if (results.length > 0) {
      setStats((prev) => {
        const next = recordGrids(prev, results)
        saveStats(next)
        return next
      })
    }

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
      showToast(`${results.length} grille${results.length > 1 ? 's' : ''} générée${results.length > 1 ? 's' : ''} !`)
    }
  }, [showToast])

  // ─── Charger les préférences, appliquer une éventuelle URL de partage ───────
  // setState au montage est nécessaire ici : l'export statique impose que le
  // premier rendu corresponde au HTML pré-généré, puis on synchronise l'état
  // depuis localStorage et l'URL (systèmes externes) une fois côté client.
  /* eslint-disable react-hooks/set-state-in-effect */
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
      if (LANGS.some((l) => l.id === prefs.lang)) {
        setLang(prefs.lang)
      }
      if (typeof prefs.printSolutions === 'boolean') {
        setPrintSolutions(prefs.printSolutions)
      }
      if (typeof prefs.interactive === 'boolean') {
        setInteractive(prefs.interactive)
      }
      if (Number.isInteger(prefs.cellSize) && prefs.cellSize >= 24 && prefs.cellSize <= 44) {
        setCellSize(prefs.cellSize)
      }
      if (Object.prototype.hasOwnProperty.call(FONT_STACKS, prefs.font)) {
        setFont(prefs.font)
      }
      if (typeof prefs.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(prefs.accent)) {
        setAccent(prefs.accent)
      }
    }

    // Mode sombre : préférence enregistrée, sinon réglage du système
    const prefersDark = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(typeof prefs?.darkMode === 'boolean' ? prefs.darkMode : prefersDark)

    // Statistiques
    setStats(loadStats())

    // URL de partage : génère automatiquement les grilles partagées
    const share = parseShareParams(window.location.search)
    if (share) {
      setDifficulty(share.difficulty)
      setTheme(share.theme)
      setLang(share.lang)
      setGridCount(share.seeds.length)
      runGeneration(share)
    }

    setPrefsLoaded(true)
  }, [runGeneration])
  /* eslint-enable react-hooks/set-state-in-effect */

  // ─── Sauvegarder les préférences ─────────────────────────────────────────────
  useEffect(() => {
    if (!prefsLoaded) return
    savePrefs({
      difficulty, gridCount, theme, lang, printSolutions,
      interactive, darkMode, cellSize, font, accent,
    })
  }, [prefsLoaded, difficulty, gridCount, theme, lang, printSolutions, interactive, darkMode, cellSize, font, accent])

  // ─── Appliquer le mode sombre ────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode === null) return
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // ─── Appliquer la personnalisation (taille, police, couleur) ─────────────────
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--cell-size', `${cellSize}px`)
    root.style.setProperty('--cell-font', FONT_STACKS[font] || FONT_STACKS.mono)
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-dark', darken(accent))
  }, [cellSize, font, accent])

  // ─── Générer les grilles ─────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (isGenerating) return
    const count = Math.min(99, Math.max(1, gridCount))
    const seeds = Array.from({ length: count }, () => randomSeed())
    runGeneration({ difficulty, theme, lang, seeds })
  }, [difficulty, gridCount, theme, lang, isGenerating, runGeneration])

  // ─── Régénérer une seule grille ──────────────────────────────────────────────
  const handleRegenerate = useCallback((index) => {
    const current = grids[index]
    if (!current) return

    const result = generateOneGrid(current.difficulty, current.theme ?? 'tous', current.lang ?? 'fr', randomSeed())
    if (!result) {
      showToast('Échec de la régénération : trop peu de mots placés. Réessayez.')
      return
    }

    setGrids((prev) => prev.map((g, i) => (i === index ? result : g)))
    setStats((prev) => {
      const next = recordGrids(prev, [result])
      saveStats(next)
      return next
    })
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

  // ─── Export SVG (un fichier par grille) ──────────────────────────────────────
  const handleExportSVG = useCallback(() => {
    if (grids.length === 0) {
      showToast('Générez d\'abord des grilles.')
      return
    }
    grids.forEach((g, i) => {
      const svg = crosswordToSVG(g, { showLetters: showSolutions })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mots-croises-grille-${i + 1}.svg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
    showToast(`${grids.length} fichier${grids.length > 1 ? 's' : ''} SVG exporté${grids.length > 1 ? 's' : ''} !`)
  }, [grids, showSolutions, showToast])

  // ─── Partage par URL ─────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    if (grids.length === 0) {
      showToast('Générez d\'abord des grilles.')
      return
    }
    const first = grids[0]
    const params = new URLSearchParams()
    params.set('d', String(first.difficulty))
    params.set('t', first.theme ?? 'tous')
    params.set('l', first.lang ?? 'fr')
    params.set('s', grids.map((g) => g.seed).join(','))
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('Lien de partage copié !'))
        .catch(() => window.prompt('Copiez le lien de partage :', url))
    } else {
      window.prompt('Copiez le lien de partage :', url)
    }
  }, [grids, showToast])

  // ─── Réinitialiser les statistiques ──────────────────────────────────────────
  const handleResetStats = useCallback(() => {
    const next = emptyStats()
    setStats(next)
    saveStats(next)
    showToast('Statistiques réinitialisées.')
  }, [showToast])

  // ─── Contrôle du nombre de grilles ───────────────────────────────────────────
  const handleCountChange = (e) => {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) setGridCount(Math.min(99, Math.max(1, v)))
  }

  const top = topWords(stats, 5)

  return (
    <>
      <Head>
        <title>Mots Croisés – Générateur</title>
        <meta name="description" content="Générateur de grilles de mots croisés français, exportable en PDF." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.svg" />
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
          <button
            className="icon-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Basculer le mode sombre"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
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

            {/* Langue */}
            <div className="control-group">
              <label>Langue des mots</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Langue de la banque de mots"
              >
                {LANGS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <div className="stats">Grilles en français ou en anglais</div>
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

            {/* Bouton SVG */}
            <button
              className="btn btn-secondary"
              onClick={handleExportSVG}
              disabled={grids.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
              Exporter en SVG ({grids.length})
            </button>

            {/* Bouton partager */}
            <button
              className="btn btn-secondary"
              onClick={handleShare}
              disabled={grids.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
              Partager par lien
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

            {/* Mode interactif */}
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
              />
              Mode interactif (remplir dans le navigateur)
            </label>

            {/* Solutions à l'impression */}
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={printSolutions}
                onChange={(e) => setPrintSolutions(e.target.checked)}
              />
              Imprimer les solutions à part
            </label>

            {/* Personnalisation */}
            <details className="sidebar-details">
              <summary>Apparence</summary>
              <div className="details-body">
                <div className="control-group">
                  <label>Taille des cases · {cellSize}px</label>
                  <input
                    type="range"
                    min={24} max={44} step={2}
                    value={cellSize}
                    onChange={(e) => setCellSize(Number(e.target.value))}
                    aria-label="Taille des cases"
                  />
                </div>
                <div className="control-group">
                  <label>Police des lettres</label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    aria-label="Police des lettres"
                  >
                    {Object.keys(FONT_STACKS).map((f) => (
                      <option key={f} value={f}>{FONT_LABELS[f]}</option>
                    ))}
                  </select>
                </div>
                <div className="control-group">
                  <label>Couleur d&apos;accent</label>
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    aria-label="Couleur d'accent"
                  />
                </div>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setCellSize(APPEARANCE_DEFAULTS.cellSize)
                    setFont(APPEARANCE_DEFAULTS.font)
                    setAccent(APPEARANCE_DEFAULTS.accent)
                  }}
                >
                  Réinitialiser l&apos;apparence
                </button>
              </div>
            </details>

            {/* Statistiques */}
            <details className="sidebar-details">
              <summary>Statistiques</summary>
              <div className="details-body">
                <div className="stats" style={{ textAlign: 'left' }}>
                  {stats.totalGrids} grille{stats.totalGrids > 1 ? 's' : ''} générée{stats.totalGrids > 1 ? 's' : ''}<br />
                  {stats.totalWords} mot{stats.totalWords > 1 ? 's' : ''} placé{stats.totalWords > 1 ? 's' : ''}
                </div>
                {top.length > 0 && (
                  <div className="top-words">
                    <div className="top-words-title">Mots les plus utilisés</div>
                    {top.map((t) => (
                      <div className="top-word" key={t.word}>
                        <span>{t.word}</span>
                        <span className="top-word-count">×{t.count}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-secondary btn-small" onClick={handleResetStats}>
                  Réinitialiser les statistiques
                </button>
              </div>
            </details>

            {grids.length > 0 && (
              <div className="stats">
                {grids.length} grille{grids.length > 1 ? 's' : ''} · difficulté {difficulty} · prêtes à imprimer
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Info hors-ligne */}
            <div className="stats" style={{ fontSize: '.72rem', lineHeight: 1.5 }}>
              ✓ Fonctionne sans internet (PWA)<br />
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
                <CrosswordGrid
                  key={`${i}-${g.seed}`}
                  data={g}
                  index={i}
                  interactive={interactive}
                  onRegenerate={() => handleRegenerate(i)}
                />
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
