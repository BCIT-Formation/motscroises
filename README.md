# Mots Croisés — Générateur de grilles

[![CI](https://github.com/BardinConsulting/motscroises/actions/workflows/ci.yml/badge.svg)](https://github.com/BardinConsulting/motscroises/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/Vercel-deployed-brightgreen?logo=vercel)](https://motscroises.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Générateur de grilles de mots croisés **100 % côté client**, sans serveur, sans internet après
le premier chargement. Exportez de 1 à 99 grilles directement en PDF pour impression.

---

## Fonctionnalités

| Fonctionnalité | Détail |
|---------------|--------|
| Génération cliente | Algorithme de placement en JS pur, aucune API externe |
| Niveaux 1 à 10 | De « Très facile » (mots courants, grille 10×10) à « Expert » (15×15, vocabulaire avancé) |
| 1 à 99 grilles | Toutes générées en une seule session, barre de progression |
| Export PDF | Via `window.print()` + CSS `@media print` — aucune dépendance |
| Hors-ligne | Fonctionne sans connexion après le premier chargement de la page |
| Aucune dépendance UI | CSS natif, pas de framework de style externe |

---

## Architecture

```
motscroises/
├── lib/
│   ├── crossword.js    # Algorithme de génération (backtracking + scoring)
│   └── words.js        # Banque de 500+ mots français + indices, niveaux 1-10
├── pages/
│   ├── _app.js         # Wrapper Next.js (import CSS global)
│   └── index.js        # Page unique — UI complète (React)
├── styles/
│   └── globals.css     # Styles + @media print pour export PDF
├── .github/
│   ├── dependabot.yml
│   └── workflows/      # CI, release, PR check, security scan
├── next.config.js      # output: 'export' (site statique)
└── package.json        # Next 14 + React 18, 2 dépendances de prod
```

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (ou pnpm / yarn)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/BardinConsulting/motscroises.git
cd motscroises

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
# → http://localhost:3000

# 4. Build de production (export statique)
npm run build
# → dossier out/

# 5. Prévisualiser le build
npx serve out
```

---

## Déploiement Vercel

```bash
# Déploiement automatique via GitHub Actions (push sur main)
# Ou manuellement :
npx vercel --prod
```

Le projet utilise `output: 'export'` dans `next.config.js` — Vercel détecte automatiquement
Next.js et déploie le site statique sans configuration supplémentaire.

---

## Variables d'environnement

Ce projet **ne nécessite aucune variable d'environnement**. Voir `.env.example` si vous
souhaitez ajouter des fonctionnalités (analytics, etc.).

---

## Utilisation

1. **Choisir la difficulté** (1 = très facile → 10 = expert) via le curseur
2. **Choisir un thème** (tous, animaux, géographie, sciences…) et le **nombre de grilles** (1 à 99)
3. Cliquer sur **Générer** — les grilles apparaissent instantanément
4. Par grille : **Voir la solution** (toggle à l'écran) ou **Régénérer** (sans toucher aux autres)
5. Cliquer sur **Exporter en PDF** — ouvre la boîte d'impression du navigateur
   (les solutions s'impriment séparément via **Imprimer les solutions**)

Les lettres sont **masquées à l'écran et à l'impression** pour rendre les grilles jouables.
Les préférences (difficulté, thème, nombre de grilles) sont conservées dans `localStorage`.

---

## Algorithme de génération

1. Les mots sont sélectionnés depuis la banque selon la plage de difficulté.
2. Triés par longueur décroissante (les mots longs en premier).
3. Le premier mot est placé horizontalement au centre de la grille.
4. Chaque mot suivant cherche toutes les intersections possibles avec les mots existants
   et choisit le placement maximisant les croisements.
5. Les cases sont numérotées selon les règles standard des mots croisés.
6. Si moins de 3 mots sont placés ou si la grille n'est pas connexe (vérifiée par
   parcours en largeur), un nouveau tirage de mots est tenté (jusqu'à 5 fois),
   puis un message d'erreur est affiché plutôt qu'une grille inutilisable.

---

## Contribution

```bash
# Forker → créer une branche
git checkout -b feat/ma-feature

# Commiter avec Conventional Commits
git commit -m "feat: ajouter thème géographie"

# Ouvrir une Pull Request vers main
```

Conventions de commits : `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`.

---

## Protection de branche (à activer sur GitHub)

Dans **Settings → Branches → Branch protection rules** pour `main` :
- [x] Require a pull request before merging
- [x] Require status checks to pass (CI)
- [x] Do not allow bypassing the above settings
- [x] Restrict who can push to matching branches

---

## Améliorations proposées

Voir [TODO.md](TODO.md) pour la liste complète, priorisée en 3 niveaux.

Points prioritaires :
1. Mode interactif (saisie dans le navigateur)
2. Tests d'intégration Playwright
3. Mode sombre
4. Partage de grille par URL

---

## Licence

MIT — libre d'utilisation, modification et distribution.
