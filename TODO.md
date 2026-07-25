# TODO — Mots Croisés

## 🔴 Critique

- [x] Ajouter des tests unitaires pour `lib/crossword.js` (placement, numérotation, bounding box)
- [x] Ajouter des tests unitaires pour `lib/words.js` (filtrage par difficulté)
- [x] Gérer le cas où trop peu de mots sont placés (< 3) → afficher un message d'erreur

## 🟠 Important

- [x] Enrichir la banque de mots (objectif : 500+ mots avec indices variés)
- [x] Ajouter une grille de solutions (imprimable séparément)
- [x] Permettre de re-générer une seule grille sans tout regénérer
- [x] Ajouter un mode "voir la solution" dans le navigateur (toggle)
- [x] Améliorer l'algorithme : s'assurer que la grille est connexe (toutes les lettres liées)
- [x] Ajouter des thèmes (animaux, géographie, sciences…)
- [x] Sauvegarder les préférences (difficulté, nb grilles) dans `localStorage`
- [x] Tests d'intégration avec Playwright (générer → afficher → imprimer)

## 🟢 Nice to have

- [x] Mode sombre
- [x] Grille interactive (remplissage dans le navigateur, vérification)
- [x] Partage de grille par URL (état encodé en query string)
- [x] Génération de grilles en anglais (banque de mots EN)
- [x] Personnalisation : taille de cellule, police, couleurs
- [x] Export SVG en plus du PDF
- [x] Statistiques (nb de grilles générées, mots les plus utilisés)
- [x] PWA (Progressive Web App) pour installation sur mobile
