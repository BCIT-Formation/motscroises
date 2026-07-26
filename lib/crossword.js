/**
 * Générateur de grilles de mots croisés — 100 % côté client, sans dépendance.
 * Algorithme : placement glouton avec scoring d'intersection. Pas de retour
 * arrière : un mot impossible à croiser est simplement ignoré, ce qui garde
 * la génération rapide (des mots de réserve compensent côté appelant).
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
export function canPlace(grid, word, row, col, dir, isFirst) {
  const size = grid.length;
  const len  = word.length;

  // Mot plus long que la grille ou position de départ hors grille
  if (len > size || row < 0 || col < 0 || row >= size || col >= size) return false;

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

    // Aucun placement valide : le mot est abandonné (pas de backtracking),
    // d'où le surplus de mots demandé par l'appelant pour atteindre la cible.
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

  // Numérotation
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
 * Vérifie que toutes les lettres de la grille sont liées entre elles
 * (une seule composante connexe, adjacence horizontale/verticale).
 * Une grille vide est considérée connexe.
 */
export function isConnected(grid) {
  const size = grid.length;
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
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const key = `${nr},${nc}`;
      if (grid[nr][nc] !== null && !visited.has(key)) {
        visited.add(key);
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
