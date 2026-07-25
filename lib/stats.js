/**
 * Statistiques d'utilisation, persistées dans localStorage.
 * Comptabilise le nombre de grilles générées et les mots les plus utilisés.
 * Aucune donnée n'est transmise : tout reste dans le navigateur.
 */

export const STATS_KEY = 'motscroises.stats';

/** Structure vide des statistiques. */
export function emptyStats() {
  return { totalGrids: 0, totalWords: 0, wordCounts: {} };
}

/**
 * Enregistre une liste de grilles générées dans les statistiques.
 * Fonction pure : retourne un nouvel objet, ne modifie pas l'entrée.
 * @param {object} stats - Statistiques actuelles
 * @param {Array}  grids - Grilles générées (chacune avec placedWords)
 */
export function recordGrids(stats, grids) {
  const next = {
    totalGrids: stats.totalGrids + grids.length,
    totalWords: stats.totalWords,
    wordCounts: { ...stats.wordCounts },
  };
  for (const g of grids) {
    for (const pw of g.placedWords) {
      next.totalWords++;
      next.wordCounts[pw.word] = (next.wordCounts[pw.word] || 0) + 1;
    }
  }
  return next;
}

/**
 * Retourne les mots les plus utilisés, triés par fréquence décroissante
 * (ordre alphabétique en cas d'égalité).
 * @param {object} stats
 * @param {number} [n=5]
 * @returns {Array<{word: string, count: number}>}
 */
export function topWords(stats, n = 5) {
  return Object.entries(stats.wordCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([word, count]) => ({ word, count }));
}

/** Charge les statistiques depuis localStorage (ou structure vide). */
export function loadStats() {
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw);
    if (
      typeof parsed !== 'object' || parsed === null ||
      !Number.isInteger(parsed.totalGrids) ||
      !Number.isInteger(parsed.totalWords) ||
      typeof parsed.wordCounts !== 'object' || parsed.wordCounts === null
    ) {
      return emptyStats();
    }
    return parsed;
  } catch {
    return emptyStats();
  }
}

/** Sauvegarde les statistiques dans localStorage. */
export function saveStats(stats) {
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Stockage indisponible : ignorer
  }
}
