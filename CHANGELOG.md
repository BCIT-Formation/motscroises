# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This file is automatically updated by [release-please](https://github.com/googleapis/release-please)
> on each merge to `main`.

---

## [1.2.0](https://github.com/BCIT-Formation/motscroises/compare/v1.1.0...v1.2.0) (2026-07-26)


### Features

* tests unitaires, gestion d'erreur de génération, banque 500+ mots et solutions imprimables ([#14](https://github.com/BCIT-Formation/motscroises/issues/14)) ([3f1ca5b](https://github.com/BCIT-Formation/motscroises/commit/3f1ca5b6911957213282654f275da1e08a194e4d))

## [1.1.0](https://github.com/BCIT-Formation/motscroises/compare/v1.0.0...v1.1.0) (2026-07-25)


### Features

* add e2e tests, dark mode, interactive grid, sharing, EN words, SVG, stats, PWA ([4ec9e36](https://github.com/BCIT-Formation/motscroises/commit/4ec9e362a4ec01e5ac4a812dc6cd45c7f2786586))
* implement 10 TODO items (tests, themes, solutions, word bank, prefs) ([430e933](https://github.com/BCIT-Formation/motscroises/commit/430e9337534f08ac04f1e80bcc135daef4ee3768))
* implement 10 TODO items (tests, themes, solutions, word bank, prefs) ([68d1eae](https://github.com/BCIT-Formation/motscroises/commit/68d1eae8bfeed8698a1ca5ae1dc29d41e83aed46))


### Bug Fixes

* adapt to Next 16 / ESLint 9 after rebase on main ([b65b2b4](https://github.com/BCIT-Formation/motscroises/commit/b65b2b49bade51885a0860d2335c0f0ee48931ad))

## 1.0.0 (2026-07-25)


### Features

* initial crossword generator app ([dcaad4d](https://github.com/BCIT-Formation/motscroises/commit/dcaad4d376cac63c640fab21d163e75e7a7ee923))


### Bug Fixes

* add lockfile and migrate to ESLint 9 flat config for Next 16 ([bda117a](https://github.com/BCIT-Formation/motscroises/commit/bda117aa7ae802e438e6b33a2661aa3dcce282c9))

## [0.1.0] — 2026-02-26

### Added
- Générateur de grilles de mots croisés 100 % côté client (JS pur)
- Banque de ~150 mots français avec indices, niveaux 1 à 10
- Sélection de la difficulté (1–10) via curseur
- Sélection du nombre de grilles (1–99)
- Export PDF via `window.print()` + CSS `@media print`
- Fonctionnement hors-ligne après premier chargement
- Interface responsive (sidebar + zone de grilles)
- Barre de progression lors de la génération multiple
- CI/CD GitHub Actions (CI, release, PR check, security audit)
- Dependabot configuré pour les dépendances npm et GitHub Actions
- Documentation complète (README, TODO, SECURITY, DECISIONS)
