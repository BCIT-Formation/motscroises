# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This file is automatically updated by [release-please](https://github.com/googleapis/release-please)
> on each merge to `main`.

---

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
