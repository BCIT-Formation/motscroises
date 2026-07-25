/**
 * Générateur de grilles de mots croisés — 100 % côté client, sans dépendance.
 * Algorithme : placement par backtracking avec scoring d'intersection.
 */

const ACROSS = 'across';
const DOWN   = 'down';

// ─── Structures de données ─────────────────────────────────────────────────────

/**
 * Crée une grille vide (null = case noire, objet = case blanche).
 */
function makeGrid(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
}

// ─── Validation de placement ───────────────────────────────────────────────────

/**
 * Vérifie si un mot peut être placé à la position donnée.
 * Retourne false si :
 *  - Déborde de la grille
 *  - Lettre incompatible avec une lettre déjà présente
 *  - Crée une adjacence non souhaitée (mots qui se touchent latéralement sans se croiser)
 *  - Premier mot : pas de contrainte d'intersection
 *  - Mots suivants : doit avoir au moins une intersection
 */
function canPlace(grid, word, row, col, dir, isFirst) {
  const size = grid.length;
  const len  = word.length;

  if (dir === ACROSS) {
    if (col + len > size) return false;
    // Pas de lettre collée avant/après
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (col + len < size && grid[row][col + len] !== null) return false;

    let intersections = 0;
    for (let i = 0; i < len; i++) {
      const cell = grid[row][col + i];
      if (cell !== null) {
        if (cell.letter !== word[i]) return false;
        intersections++;
      } else {
        // Case vide : vérifier les voisins haut/bas (éviter adjacence non-croisée)
        if (row > 0 && grid[row - 1][col + i] !== null) return false;
        if (row < size - 1 && grid[row + 1][col + i] !== null) return false;
      }
    }
    return isFirst || intersections > 0;
  } else {
    // DOWN
    if (row + len > size) return false;
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (row + len < size && grid[row + len][col] !== null) return false;

    let intersections = 0;
    for (let i = 0; i < len; i++) {
      const cell = grid[row + i][col];
      if (cell !== null) {
        if (cell.letter !== word[i]) return false;
        intersections++;
      } else {
        if (col > 0 && grid[row + i][col - 1] !== null) return false;
        if (col < size - 1 && grid[row + i][col + 1] !== null) return false;
      }
    }
    return isFirst || intersections > 0;
  }
}

// ─── Placement ─────────────────────────────────────────────────────────────────

function placeWord(grid, word, row, col, dir) {
  for (let i = 0; i < word.length; i++) {
    const r = dir === ACROSS ? row : row + i;
    const c = dir === ACROSS ? col + i : col;
    if (grid[r][c] === null) {
      grid[r][c] = { letter: word[i] };
    }
    // Si déjà occupé, la lettre doit correspondre (validée en amont)
  }
}

// ─── Numérotation ──────────────────────────────────────────────────────────────

/**
 * Numérote les cases de départ de chaque mot (standard mots croisés).
 * Une case reçoit un numéro si elle commence un mot horizontal ou vertical.
 */
function numberGrid(grid, placedWords) {
  const size = grid.length;
  let num = 1;
  // Tableau temporaire des numéros
  const numbers = Array.from({ length: size }, () => Array(size).fill(null));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) continue;

      const startsAcross =
        (c === 0 || grid[r][c - 1] === null) &&
        c + 1 < size && grid[r][c + 1] !== null;

      const startsDown =
        (r === 0 || grid[r - 1][c] === null) &&
        r + 1 < size && grid[r + 1][c] !== null;

      if (startsAcross || startsDown) {
        numbers[r][c] = num++;
      }
    }
  }

  // Associer les numéros aux mots placés
  const numberedWords = placedWords.map((pw) => {
    const n = numbers[pw.row][pw.col];
    return { ...pw, number: n };
  });

  return { numbers, numberedWords };
}

// ─── Algorithme principal ──────────────────────────────────────────────────────

/**
 * Génère une grille de mots croisés.
 * @param {Array}  wordList  - Tableau { word, clue }
 * @param {number} size      - Taille de la grille (NxN)
 * @returns {{ grid, placedWords, acrossClues, downClues, size }}
 */
export function generateCrossword(wordList, size) {
  const grid = makeGrid(size);
  const placedWords = [];

  // Trier par longueur décroissante pour maximiser les intersections
  const sorted = [...wordList].sort((a, b) => b.word.length - a.word.length);

  for (let wi = 0; wi < sorted.length; wi++) {
    const { word, clue } = sorted[wi];
    const isFirst = placedWords.length === 0;
    let bestPlacement = null;
    let bestScore = -1;

    if (isFirst) {
      // Premier mot : placer horizontalement au centre
      const row = Math.floor(size / 2);
      const col = Math.floor((size - word.length) / 2);
      if (canPlace(grid, word, row, col, ACROSS, true)) {
        bestPlacement = { row, col, dir: ACROSS };
        bestScore = 0;
      }
    } else {
      // Chercher toutes les positions valides
      const candidates = [];

      for (const pw of placedWords) {
        for (let pi = 0; pi < pw.word.length; pi++) {
          for (let wi2 = 0; wi2 < word.length; wi2++) {
            if (pw.word[pi] !== word[wi2]) continue;

            // Placement perpendiculaire
            if (pw.dir === ACROSS) {
              // Nouveau mot en DOWN
              const row = pw.row - wi2;
              const col = pw.col + pi;
              if (row >= 0 && canPlace(grid, word, row, col, DOWN, false)) {
                candidates.push({ row, col, dir: DOWN, intersections: countIntersections(grid, word, row, col, DOWN) });
              }
            } else {
              // Nouveau mot en ACROSS
              const row = pw.row + pi;
              const col = pw.col - wi2;
              if (col >= 0 && canPlace(grid, word, row, col, ACROSS, false)) {
                candidates.push({ row, col, dir: ACROSS, intersections: countIntersections(grid, word, row, col, ACROSS) });
              }
            }
          }
        }
      }

      // Choisir le placement avec le plus d'intersections (mots croisés denses)
      for (const c of candidates) {
        if (c.intersections > bestScore) {
          bestScore = c.intersections;
          bestPlacement = c;
        }
      }
    }

    if (bestPlacement) {
      placeWord(grid, word, bestPlacement.row, bestPlacement.col, bestPlacement.dir);
      placedWords.push({
        word,
        clue,
        row: bestPlacement.row,
        col: bestPlacement.col,
        dir: bestPlacement.dir,
      });
    }
  }

  return finalizeCrossword(grid, placedWords, size);
}

/**
 * Numérote la grille et construit les listes d'indices à partir des mots placés.
 */
function finalizeCrossword(grid, placedWords, size) {
  const { numbers, numberedWords } = numberGrid(grid, placedWords);

  // Séparer horizontaux / verticaux et construire les listes d'indices
  const acrossClues = numberedWords
    .filter((w) => w.dir === ACROSS)
    .sort((a, b) => a.number - b.number)
    .map((w) => ({ number: w.number, clue: w.clue, word: w.word }));

  const downClues = numberedWords
    .filter((w) => w.dir === DOWN)
    .sort((a, b) => a.number - b.number)
    .map((w) => ({ number: w.number, clue: w.clue, word: w.word }));

  return { grid, numbers, placedWords: numberedWords, acrossClues, downClues, size };
}

/**
 * Reconstruit une grille complète à partir de placements connus
 * (mots + positions + directions), par exemple décodés depuis une URL de partage.
 * Retourne null si un placement est invalide (hors grille ou lettres en conflit).
 */
export function rebuildCrossword(placements, size) {
  if (!Number.isInteger(size) || size < 1 || !Array.isArray(placements)) return null;

  const grid = makeGrid(size);
  const placedWords = [];

  for (const p of placements) {
    if (
      !p || typeof p.word !== 'string' || p.word.length === 0 ||
      !Number.isInteger(p.row) || !Number.isInteger(p.col) ||
      (p.dir !== ACROSS && p.dir !== DOWN)
    ) {
      return null;
    }

    // Validation : dans la grille et compatible avec les lettres déjà posées
    for (let i = 0; i < p.word.length; i++) {
      const r = p.dir === ACROSS ? p.row : p.row + i;
      const c = p.dir === ACROSS ? p.col + i : p.col;
      if (r < 0 || r >= size || c < 0 || c >= size) return null;
      const cell = grid[r][c];
      if (cell !== null && cell.letter !== p.word[i]) return null;
    }

    placeWord(grid, p.word, p.row, p.col, p.dir);
    placedWords.push({
      word: p.word,
      clue: typeof p.clue === 'string' ? p.clue : '',
      row: p.row,
      col: p.col,
      dir: p.dir,
    });
  }

  return finalizeCrossword(grid, placedWords, size);
}

/** Compte le nombre d'intersections d'un mot avec la grille existante. */
function countIntersections(grid, word, row, col, dir) {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    const r = dir === ACROSS ? row : row + i;
    const c = dir === ACROSS ? col + i : col;
    if (grid[r] && grid[r][c] !== null) count++;
  }
  return count;
}

// ─── Connexité ─────────────────────────────────────────────────────────────────

/**
 * Vérifie que toutes les cases blanches de la grille forment un seul bloc
 * connexe (chaque lettre est reliée aux autres horizontalement ou verticalement).
 * L'algorithme de placement le garantit par construction (chaque mot doit
 * croiser un mot existant) ; cette fonction sert de garde-fou vérifiable.
 * Une grille vide est considérée comme connexe.
 */
export function isGridConnected(grid) {
  const size = grid.length;

  // Trouver une première case blanche et compter le total
  let start = null;
  let total = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        total++;
        if (!start) start = [r, c];
      }
    }
  }
  if (total === 0) return true;

  // Parcours en largeur depuis la première case blanche
  const visited = new Set([`${start[0]},${start[1]}`]);
  const queue = [start];
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 && nr < size && nc >= 0 && nc < size &&
        grid[nr][nc] !== null && !visited.has(`${nr},${nc}`)
      ) {
        visited.add(`${nr},${nc}`);
        queue.push([nr, nc]);
      }
    }
  }

  return visited.size === total;
}

// ─── Bounding box ──────────────────────────────────────────────────────────────

/**
 * Retourne la zone minimale de la grille qui contient des lettres.
 * Utile pour l'affichage (rogner les bords noirs inutiles).
 */
export function getBoundingBox(grid) {
  const size = grid.length;
  let minR = size, maxR = 0, minC = size, maxC = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== null) {
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  if (minR > maxR) return { minR: 0, maxR: size - 1, minC: 0, maxC: size - 1 };
  return { minR, maxR, minC, maxC };
}
