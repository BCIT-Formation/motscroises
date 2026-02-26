# TODO — Mots Croisés

## 🔴 Critique

- [ ] Ajouter des tests unitaires pour `lib/crossword.js` (placement, numérotation, bounding box)
- [ ] Ajouter des tests unitaires pour `lib/words.js` (filtrage par difficulté)
- [ ] Gérer le cas où trop peu de mots sont placés (< 3) → afficher un message d'erreur

## 🟠 Important

- [ ] Enrichir la banque de mots (objectif : 500+ mots avec indices variés)
- [ ] Ajouter une grille de solutions (imprimable séparément)
- [ ] Permettre de re-générer une seule grille sans tout regénérer
- [ ] Ajouter un mode "voir la solution" dans le navigateur (toggle)
- [ ] Améliorer l'algorithme : s'assurer que la grille est connexe (toutes les lettres liées)
- [ ] Ajouter des thèmes (animaux, géographie, sciences…)
- [ ] Sauvegarder les préférences (difficulté, nb grilles) dans `localStorage`
- [ ] Tests d'intégration avec Playwright (générer → afficher → imprimer)

## 🟢 Nice to have

- [ ] Mode sombre
- [ ] Grille interactive (remplissage dans le navigateur, vérification)
- [ ] Partage de grille par URL (état encodé en query string)
- [ ] Génération de grilles en anglais (banque de mots EN)
- [ ] Personnalisation : taille de cellule, police, couleurs
- [ ] Export SVG en plus du PDF
- [ ] Statistiques (nb de grilles générées, mots les plus utilisés)
- [ ] PWA (Progressive Web App) pour installation sur mobile
