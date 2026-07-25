/**
 * Générateur pseudo-aléatoire déterministe (mulberry32).
 * Permet de partager une grille par URL : même graine → même grille.
 * Aucune dépendance externe.
 */

/**
 * Retourne une fonction rng() → [0, 1) déterministe pour une graine donnée.
 * @param {number} seed - Graine entière (32 bits)
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Génère une graine aléatoire positive (31 bits, compacte dans une URL).
 */
export function randomSeed() {
  return Math.floor(Math.random() * 2147483647);
}
