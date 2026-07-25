/**
 * Export SVG d'une grille de mots croisés.
 * Génère un document SVG autonome (vectoriel, imprimable, éditable)
 * en plus de l'export PDF via l'impression navigateur.
 */

import { getBoundingBox } from './crossword';

/**
 * Convertit une grille générée en document SVG (chaîne de caractères).
 * @param {object} data - Résultat de generateCrossword (grid, numbers…)
 * @param {object} [options]
 * @param {boolean} [options.showLetters=false] - Inclure les lettres (solution)
 * @param {number}  [options.cellSize=32] - Taille d'une case en pixels
 * @returns {string} Document SVG complet
 */
export function crosswordToSVG(data, { showLetters = false, cellSize = 32 } = {}) {
  const { grid, numbers } = data;
  const { minR, maxR, minC, maxC } = getBoundingBox(grid);
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const pad = 1; // marge pour le trait de bordure
  const width  = cols * cellSize + pad * 2;
  const height = rows * cellSize + pad * 2;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`,
  ];

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const x = pad + (c - minC) * cellSize;
      const y = pad + (r - minR) * cellSize;
      const cell = grid[r][c];
      const fill = cell === null ? '#000000' : '#ffffff';
      parts.push(
        `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="#000000" stroke-width="1"/>`
      );

      if (cell === null) continue;

      const num = numbers[r][c];
      if (num) {
        parts.push(
          `<text x="${x + 2}" y="${y + Math.round(cellSize * 0.28)}" font-family="monospace" font-size="${Math.round(cellSize * 0.25)}" font-weight="bold" fill="#333333">${num}</text>`
        );
      }

      if (showLetters) {
        parts.push(
          `<text x="${x + cellSize / 2}" y="${y + cellSize / 2}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="${Math.round(cellSize * 0.5)}" font-weight="bold" fill="#1a1a1a">${cell.letter}</text>`
        );
      }
    }
  }

  parts.push('</svg>');
  return parts.join('\n');
}
