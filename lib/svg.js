/**
 * Export SVG d'une grille de mots croisés — aucune dépendance externe.
 * Produit un document SVG autonome (imprimable, insérable dans un document).
 */

import { getBoundingBox } from './crossword';

const CELL = 32;      // taille d'une case en px
const MARGIN = 4;     // marge autour de la grille

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Construit le SVG d'une grille.
 * @param {Array}   grid        - Grille (null = case noire)
 * @param {Array}   numbers     - Numéros des cases de départ
 * @param {object}  [options]
 * @param {boolean} [options.showLetters=false] - true pour la grille solution
 * @param {string}  [options.title]             - Titre accessible du SVG
 * @returns {string} Document SVG complet
 */
export function crosswordToSvg(grid, numbers, options = {}) {
  const { showLetters = false, title = 'Grille de mots croisés' } = options;
  const { minR, maxR, minC, maxC } = getBoundingBox(grid);

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const width = cols * CELL + MARGIN * 2;
  const height = rows * CELL + MARGIN * 2;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
    `viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">`
  );
  parts.push(`<title>${escapeXml(title)}</title>`);
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`);

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const x = MARGIN + (c - minC) * CELL;
      const y = MARGIN + (r - minR) * CELL;
      const cell = grid[r][c];

      if (cell === null) {
        parts.push(
          `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#1a1a1a" stroke="#333333" stroke-width="1"/>`
        );
        continue;
      }

      parts.push(
        `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" fill="#ffffff" stroke="#333333" stroke-width="1"/>`
      );

      const num = numbers[r][c];
      if (num) {
        parts.push(
          `<text x="${x + 2}" y="${y + 9}" font-family="monospace" font-size="8" font-weight="bold" fill="#333333">${num}</text>`
        );
      }

      if (showLetters) {
        parts.push(
          `<text x="${x + CELL / 2}" y="${y + CELL / 2 + 5}" text-anchor="middle" ` +
          `font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#1a1a1a">${escapeXml(cell.letter)}</text>`
        );
      }
    }
  }

  parts.push('</svg>');
  return parts.join('\n');
}
