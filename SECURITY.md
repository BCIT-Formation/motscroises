# Politique de sécurité

## Versions supportées

| Version | Supportée |
|---------|-----------|
| 1.x     | ✅        |

## Périmètre de sécurité

Ce projet est une **application statique côté client**.
- Aucune donnée utilisateur n'est collectée, stockée ou transmise.
- Aucun backend, aucune base de données, aucune authentification.
- Tout le code tourne dans le navigateur du visiteur.

Les risques de sécurité sont donc très limités et concernent principalement :
- Les dépendances npm (Next.js, React)
- Le pipeline CI/CD

## Signalement d'une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, **ne pas ouvrir une issue publique**.

Signalez-la de manière privée via :
- GitHub Security Advisories (onglet *Security* du dépôt)
- Ou par email si disponible dans le profil du mainteneur

Nous nous engageons à :
1. Accuser réception sous **48 heures**
2. Évaluer la vulnérabilité sous **7 jours**
3. Publier un correctif sous **30 jours** si applicable

## Dépendances

Les mises à jour de sécurité des dépendances sont gérées automatiquement
via Dependabot (voir `.github/dependabot.yml`).

Exécutez régulièrement `npm audit` pour vérifier l'état des dépendances.
