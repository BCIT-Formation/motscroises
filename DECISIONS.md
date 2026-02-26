# Décisions techniques (Architecture Decision Records)

## ADR-001 — Next.js + export statique

**Décision :** Utiliser Next.js avec `output: 'export'` pour générer un site statique.

**Raison :** Vercel supporte nativement Next.js. L'export statique permet un déploiement
sans serveur (serverless), réduisant les coûts et améliorant la disponibilité.
L'application ne nécessite aucun back-end car tout le traitement est client.

**Alternative rejetée :** Vite + React — aurait nécessité une configuration Vercel manuelle.

---

## ADR-002 — Zéro dépendance pour la génération et le PDF

**Décision :** Pas de librairie tierce pour la génération de mots croisés ni pour l'export PDF.

**Raison :**
- La génération utilise un algorithme de backtracking en JS pur (< 200 lignes).
- L'export PDF utilise `window.print()` avec une feuille de style CSS `@media print`.
  C'est la méthode la plus universelle, sans dépendance, et produit un PDF de qualité
  identique à l'impression native du navigateur.

**Alternative rejetée :** `jsPDF` — 300 Ko de bundle, plus complexe, rendu inférieur
au CSS print natif pour les tableaux.

---

## ADR-003 — Banque de mots embarquée

**Décision :** Les mots et leurs indices sont embarqués dans le bundle JS (`lib/words.js`).

**Raison :** L'application doit fonctionner **sans internet**. Avoir les mots dans le code
garantit un fonctionnement 100 % hors-ligne après le premier chargement.

**Alternative rejetée :** API externe de dictionnaire — rendrait l'app dépendante du réseau.

---

## ADR-004 — Algorithme de placement par intersections prioritaires

**Décision :** Les mots sont placés en priorisant le placement avec le plus d'intersections
avec les mots déjà posés.

**Raison :** Produit des grilles denses et connexes, caractéristique d'un bon mots croisés.
Les mots sont triés par longueur décroissante avant placement pour maximiser les
opportunités d'intersection.

---

## ADR-005 — Génération asynchrone avec `setTimeout(resolve, 0)`

**Décision :** Chaque grille est générée dans une micro-tâche séparée.

**Raison :** Évite de bloquer le thread principal lors de la génération de nombreuses grilles
(jusqu'à 99), permettant à l'UI de se mettre à jour (barre de progression) entre chaque
génération.

---

## ADR-006 — CSS natif, pas de framework UI

**Décision :** Styles écrits entièrement en CSS natif dans `styles/globals.css`.

**Raison :** Aucune dépendance supplémentaire, taille de bundle minimale, contrôle total
du rendu print. Tailwind ou MUI auraient alourdi le bundle sans apporter de valeur ajoutée
pour une app d'une seule page.
