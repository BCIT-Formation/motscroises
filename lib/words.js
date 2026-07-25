/**
 * Banque de mots français pour la génération de mots croisés.
 * Chaque mot contient : mot, indice, niveau (1, 3, 5, 7 ou 9), catégorie.
 * Les plages de niveaux se chevauchent volontairement entre difficultés
 * voisines pour garder un pool de mots suffisant à chaque tirage.
 * Aucune dépendance externe — tout est embarqué dans l'application (ADR-003).
 */

export const WORD_BANK = [
  // ─── Niveau 1-2 : Mots très courants ───────────────────────────────────────
  { word: 'CHAT',    clue: 'Animal domestique qui ronronne',          level: 1, cat: 'animaux' },
  { word: 'CHIEN',   clue: 'Meilleur ami de l\'homme',               level: 1, cat: 'animaux' },
  { word: 'MAISON',  clue: 'On y vit en famille',                    level: 1, cat: 'lieux' },
  { word: 'SOLEIL',  clue: 'Étoile de notre système',                level: 1, cat: 'nature' },
  { word: 'ARBRE',   clue: 'Végétal avec un tronc et des branches',  level: 1, cat: 'nature' },
  { word: 'LIVRE',   clue: 'On y lit des histoires',                 level: 1, cat: 'objets' },
  { word: 'TABLE',   clue: 'Meuble sur lequel on mange',             level: 1, cat: 'objets' },
  { word: 'PORTE',   clue: 'Elle s\'ouvre et se ferme',              level: 1, cat: 'objets' },
  { word: 'EAU',     clue: 'Liquide vital, H₂O',                    level: 1, cat: 'nature' },
  { word: 'PAIN',    clue: 'Aliment de base en France',              level: 1, cat: 'nourriture' },
  { word: 'LUNE',    clue: 'Satellite naturel de la Terre',          level: 1, cat: 'nature' },
  { word: 'FLEUR',   clue: 'Elle pousse dans les jardins',           level: 1, cat: 'nature' },
  { word: 'ROUGE',   clue: 'Couleur du feu et du sang',              level: 1, cat: 'couleurs' },
  { word: 'BLEU',    clue: 'Couleur du ciel et de la mer',           level: 1, cat: 'couleurs' },
  { word: 'ROSE',    clue: 'Couleur entre rouge et blanc',           level: 1, cat: 'couleurs' },
  { word: 'VERT',    clue: 'Couleur de l\'herbe',                   level: 1, cat: 'couleurs' },
  { word: 'NUIT',    clue: 'Période d\'obscurité',                   level: 1, cat: 'temps' },
  { word: 'JOUR',    clue: 'Période de lumière',                     level: 1, cat: 'temps' },
  { word: 'MOIS',    clue: 'Unité de temps : janvier, février…',    level: 1, cat: 'temps' },
  { word: 'VACHE',   clue: 'Elle nous donne du lait',               level: 1, cat: 'animaux' },
  { word: 'CHEVAL',  clue: 'Animal monté par les cavaliers',         level: 1, cat: 'animaux' },
  { word: 'LAPIN',   clue: 'Petit mammifère aux longues oreilles',   level: 1, cat: 'animaux' },
  { word: 'OISEAU',  clue: 'Animal à plumes qui vole',              level: 1, cat: 'animaux' },
  { word: 'POULE',   clue: 'Elle pond des œufs',                    level: 1, cat: 'animaux' },
  { word: 'MOUTON',  clue: 'Animal à laine',                        level: 1, cat: 'animaux' },
  { word: 'BALLE',   clue: 'Objet rond qu\'on lance',               level: 1, cat: 'sport' },
  { word: 'CORDE',   clue: 'On la saute ou on l\'escalade',         level: 1, cat: 'objets' },
  { word: 'ECOLE',   clue: 'Lieu d\'apprentissage pour enfants',    level: 1, cat: 'lieux' },
  { word: 'CLASSE',  clue: 'Salle où l\'on apprend',                level: 1, cat: 'lieux' },
  { word: 'CRAYON',  clue: 'On écrit ou dessine avec lui',          level: 1, cat: 'objets' },

  // ─── Niveau 3-4 : Mots courants ────────────────────────────────────────────
  { word: 'JARDIN',   clue: 'Espace vert autour d\'une maison',      level: 3, cat: 'lieux' },
  { word: 'FENETRE',  clue: 'Ouverture vitrée dans un mur',          level: 3, cat: 'objets' },
  { word: 'CUISINE',  clue: 'Pièce où l\'on prépare les repas',      level: 3, cat: 'lieux' },
  { word: 'CHAMBRE',  clue: 'Pièce où l\'on dort',                   level: 3, cat: 'lieux' },
  { word: 'CHAISE',   clue: 'Meuble pour s\'asseoir',                level: 3, cat: 'objets' },
  { word: 'BOUGIE',   clue: 'Source de lumière à flamme',            level: 3, cat: 'objets' },
  { word: 'LAMPE',    clue: 'Appareil d\'éclairage électrique',      level: 3, cat: 'objets' },
  { word: 'HORLOGE',  clue: 'Instrument qui mesure le temps',        level: 3, cat: 'objets' },
  { word: 'MIROIR',   clue: 'Surface réfléchissante',                level: 3, cat: 'objets' },
  { word: 'TAPIS',    clue: 'Revêtement souple de sol',              level: 3, cat: 'objets' },
  { word: 'PLAGE',    clue: 'Bord de mer sablonneux',                level: 3, cat: 'lieux' },
  { word: 'FORET',    clue: 'Vaste étendue boisée',                  level: 3, cat: 'nature' },
  { word: 'RIVIERE',  clue: 'Cours d\'eau moins grand qu\'un fleuve', level: 3, cat: 'nature' },
  { word: 'MONTAGNE', clue: 'Relief élevé de la terre',              level: 3, cat: 'nature' },
  { word: 'NUAGE',    clue: 'Amas de vapeur d\'eau dans le ciel',    level: 3, cat: 'nature' },
  { word: 'PLUIE',    clue: 'Précipitation liquide',                 level: 3, cat: 'nature' },
  { word: 'NEIGE',    clue: 'Précipitation blanche et froide',       level: 3, cat: 'nature' },
  { word: 'VENT',     clue: 'Mouvement de l\'air',                   level: 3, cat: 'nature' },
  { word: 'PIERRE',   clue: 'Roche, matériau dur',                   level: 3, cat: 'nature' },
  { word: 'TERRE',    clue: 'Notre planète, ou le sol',              level: 3, cat: 'nature' },
  { word: 'BATEAU',   clue: 'Véhicule qui navigue sur l\'eau',       level: 3, cat: 'transports' },
  { word: 'AVION',    clue: 'Véhicule qui vole dans les airs',       level: 3, cat: 'transports' },
  { word: 'TRAIN',    clue: 'Véhicule sur rails',                    level: 3, cat: 'transports' },
  { word: 'VELO',     clue: 'Véhicule à deux roues sans moteur',     level: 3, cat: 'transports' },
  { word: 'VOITURE',  clue: 'Véhicule automobile à quatre roues',    level: 3, cat: 'transports' },
  { word: 'MUSIQUE',  clue: 'Art des sons et des rythmes',           level: 3, cat: 'arts' },
  { word: 'CHANSON',  clue: 'Composition musicale avec paroles',     level: 3, cat: 'arts' },
  { word: 'PEINTURE', clue: 'Art d\'appliquer des couleurs sur une surface', level: 3, cat: 'arts' },
  { word: 'CINEMA',   clue: 'Salle de projection de films',          level: 3, cat: 'loisirs' },
  { word: 'THEATRE',  clue: 'Lieu de représentation scénique',       level: 3, cat: 'arts' },
  { word: 'CADEAU',   clue: 'Présent offert à quelqu\'un',           level: 3, cat: 'divers' },
  { word: 'ARGENT',   clue: 'Monnaie, ou métal précieux gris',       level: 3, cat: 'divers' },
  { word: 'MARCHE',   clue: 'Promenade à pied, ou escalier',         level: 3, cat: 'divers' },
  { word: 'COURSE',   clue: 'Compétition de vitesse',                level: 3, cat: 'sport' },
  { word: 'EQUIPE',   clue: 'Groupe de personnes qui jouent ensemble', level: 3, cat: 'sport' },
  { word: 'BALLON',   clue: 'Sphère gonflée d\'air pour les sports', level: 3, cat: 'sport' },
  { word: 'MATCH',    clue: 'Rencontre sportive',                    level: 3, cat: 'sport' },
  { word: 'STADE',    clue: 'Enceinte sportive',                     level: 3, cat: 'sport' },
  { word: 'POMME',    clue: 'Fruit rond qui tombe des arbres',       level: 3, cat: 'nourriture' },
  { word: 'ORANGE',   clue: 'Fruit agrume juteux',                   level: 3, cat: 'nourriture' },
  { word: 'RAISIN',   clue: 'Fruit en grappes, sert à faire du vin', level: 3, cat: 'nourriture' },
  { word: 'TOMATE',   clue: 'Légume rouge ou fruit selon la botanique', level: 3, cat: 'nourriture' },
  { word: 'CAROTTE',  clue: 'Légume orange allongé',                 level: 3, cat: 'nourriture' },
  { word: 'FROMAGE',  clue: 'Produit laitier fermenté',              level: 3, cat: 'nourriture' },
  { word: 'GATEAU',   clue: 'Pâtisserie sucrée',                    level: 3, cat: 'nourriture' },
  { word: 'CHOCOLAT', clue: 'Confiserie brune à base de cacao',      level: 3, cat: 'nourriture' },
  { word: 'CAFE',     clue: 'Boisson chaude tirée de grains torréfiés', level: 3, cat: 'nourriture' },
  { word: 'LAIT',     clue: 'Liquide blanc produit par les mammifères', level: 3, cat: 'nourriture' },

  // ─── Niveau 5-6 : Mots intermédiaires ──────────────────────────────────────
  { word: 'BIBLIOTHEQUE', clue: 'Lieu de conservation et de prêt de livres', level: 5, cat: 'lieux' },
  { word: 'PHARMACIE',    clue: 'Lieu où l\'on vend des médicaments',        level: 5, cat: 'lieux' },
  { word: 'BOULANGERIE',  clue: 'Lieu où l\'on fabrique et vend du pain',    level: 5, cat: 'lieux' },
  { word: 'SUPERMARCHE',  clue: 'Grand magasin alimentaire en libre-service', level: 5, cat: 'lieux' },
  { word: 'UNIVERSITE',   clue: 'Établissement d\'enseignement supérieur',   level: 5, cat: 'lieux' },
  { word: 'TELESCOPE',    clue: 'Instrument pour observer les astres',        level: 5, cat: 'sciences' },
  { word: 'MICROSCOPE',   clue: 'Instrument pour voir l\'infiniment petit',  level: 5, cat: 'sciences' },
  { word: 'CHIMIE',       clue: 'Science de la matière et ses transformations', level: 5, cat: 'sciences' },
  { word: 'PHYSIQUE',     clue: 'Science des lois de la nature',             level: 5, cat: 'sciences' },
  { word: 'BIOLOGIE',     clue: 'Science du vivant',                         level: 5, cat: 'sciences' },
  { word: 'GEOGRAPHIE',   clue: 'Science qui étudie la surface terrestre',   level: 5, cat: 'sciences' },
  { word: 'HISTOIRE',     clue: 'Science qui étudie le passé humain',        level: 5, cat: 'sciences' },
  { word: 'PHILOSOPHIE',  clue: 'Science de la sagesse et de la réflexion',  level: 5, cat: 'sciences' },
  { word: 'PSYCHOLOGIE',  clue: 'Science qui étudie le comportement humain', level: 5, cat: 'sciences' },
  { word: 'ECONOMIE',     clue: 'Science de la production et des échanges',  level: 5, cat: 'sciences' },
  { word: 'ELEPHANT',     clue: 'Plus grand mammifère terrestre',            level: 5, cat: 'animaux' },
  { word: 'GIRAFE',       clue: 'Animal au cou très long',                   level: 5, cat: 'animaux' },
  { word: 'TIGRE',        clue: 'Félin rayé d\'Asie',                       level: 5, cat: 'animaux' },
  { word: 'LION',         clue: 'Roi des animaux, félin africain',           level: 5, cat: 'animaux' },
  { word: 'REQUIN',       clue: 'Poisson prédateur des mers',                level: 5, cat: 'animaux' },
  { word: 'DAUPHIN',      clue: 'Mammifère marin intelligent et joueur',     level: 5, cat: 'animaux' },
  { word: 'BALEINE',      clue: 'Plus grand mammifère marin',               level: 5, cat: 'animaux' },
  { word: 'PAPILLON',     clue: 'Insecte aux ailes colorées',               level: 5, cat: 'animaux' },
  { word: 'ARAIGNEE',     clue: 'Arachnide tisseuse de toiles',             level: 5, cat: 'animaux' },
  { word: 'CROCODILE',    clue: 'Grand reptile des marais tropicaux',        level: 5, cat: 'animaux' },
  { word: 'FOOTBALL',     clue: 'Sport collectif avec un ballon rond',       level: 5, cat: 'sport' },
  { word: 'NATATION',     clue: 'Sport aquatique',                          level: 5, cat: 'sport' },
  { word: 'CYCLISME',     clue: 'Sport pratiqué sur un vélo',               level: 5, cat: 'sport' },
  { word: 'ATHLETISME',   clue: 'Ensemble des sports de course et de saut', level: 5, cat: 'sport' },
  { word: 'ESCALADE',     clue: 'Sport consistant à grimper',               level: 5, cat: 'sport' },
  { word: 'GUITARE',      clue: 'Instrument à cordes que l\'on gratte',     level: 5, cat: 'arts' },
  { word: 'VIOLON',       clue: 'Instrument à cordes et archet',            level: 5, cat: 'arts' },
  { word: 'PIANO',        clue: 'Instrument à clavier à 88 touches',        level: 5, cat: 'arts' },
  { word: 'TROMPETTE',    clue: 'Instrument à vent en cuivre',              level: 5, cat: 'arts' },
  { word: 'SCULPTURE',    clue: 'Art de créer des formes en volume',        level: 5, cat: 'arts' },
  { word: 'ARCHITECTURE', clue: 'Art de concevoir et construire des édifices', level: 5, cat: 'arts' },
  { word: 'PHOTOGRAPHIE', clue: 'Art de capturer des images par la lumière', level: 5, cat: 'arts' },
  { word: 'PRINTEMPS',    clue: 'Saison entre hiver et été',               level: 5, cat: 'temps' },
  { word: 'AUTOMNE',      clue: 'Saison entre été et hiver',               level: 5, cat: 'temps' },
  { word: 'NOEL',         clue: 'Fête du 25 décembre',                      level: 5, cat: 'fetes' },

  // ─── Niveau 7-8 : Mots avancés ─────────────────────────────────────────────
  { word: 'ARCHIPEL',     clue: 'Ensemble d\'îles dans une mer',           level: 7, cat: 'geographie' },
  { word: 'PRESQU',       clue: 'Portion de terre entourée d\'eau (île)',  level: 7, cat: 'geographie' },
  { word: 'FJORD',        clue: 'Bras de mer encaissé d\'origine glaciaire', level: 7, cat: 'geographie' },
  { word: 'VOLCAN',       clue: 'Montagne crachant du feu et de la lave',  level: 7, cat: 'geographie' },
  { word: 'SEISME',       clue: 'Tremblement de terre',                    level: 7, cat: 'geographie' },
  { word: 'TSUNAMI',      clue: 'Vague géante causée par un séisme',       level: 7, cat: 'geographie' },
  { word: 'ECLIPSE',      clue: 'Occultation d\'un astre par un autre',    level: 7, cat: 'astronomie' },
  { word: 'COMETE',       clue: 'Corps céleste à longue traîne lumineuse', level: 7, cat: 'astronomie' },
  { word: 'GALAXIE',      clue: 'Système de milliards d\'étoiles',         level: 7, cat: 'astronomie' },
  { word: 'NEBULEUSE',    clue: 'Nuage de gaz et poussières interstellaires', level: 7, cat: 'astronomie' },
  { word: 'PHOTON',       clue: 'Particule élémentaire de lumière',        level: 7, cat: 'physique' },
  { word: 'ELECTRON',     clue: 'Particule chargée négativement',          level: 7, cat: 'physique' },
  { word: 'PROTON',       clue: 'Particule du noyau atomique chargée +',   level: 7, cat: 'physique' },
  { word: 'ATOME',        clue: 'Plus petite unité d\'un élément chimique', level: 7, cat: 'physique' },
  { word: 'MOLECULE',     clue: 'Ensemble d\'atomes liés chimiquement',    level: 7, cat: 'physique' },
  { word: 'SYMBIOSE',     clue: 'Association bénéfique de deux espèces',   level: 7, cat: 'biologie' },
  { word: 'CHLOROPHYLLE', clue: 'Pigment vert des plantes',                level: 7, cat: 'biologie' },
  { word: 'CHROMOSOME',   clue: 'Structure portant l\'ADN dans la cellule', level: 7, cat: 'biologie' },
  { word: 'MEMBRANE',     clue: 'Fine couche qui entoure une cellule',     level: 7, cat: 'biologie' },
  { word: 'EVAPORATION',  clue: 'Passage de l\'état liquide à gazeux',     level: 7, cat: 'physique' },
  { word: 'CONDENSATION', clue: 'Passage de l\'état gazeux à liquide',     level: 7, cat: 'physique' },
  { word: 'COMBUSTION',   clue: 'Réaction chimique produisant chaleur et lumière', level: 7, cat: 'chimie' },
  { word: 'CATALYSE',     clue: 'Accélération d\'une réaction par un tiers', level: 7, cat: 'chimie' },
  { word: 'OXYDATION',    clue: 'Réaction avec l\'oxygène, cause la rouille', level: 7, cat: 'chimie' },
  { word: 'PALINDROME',   clue: 'Mot se lisant identiquement dans les deux sens', level: 7, cat: 'langue' },
  { word: 'SYNONYME',     clue: 'Mot de sens identique à un autre',        level: 7, cat: 'langue' },
  { word: 'ANTONYME',     clue: 'Mot de sens contraire à un autre',        level: 7, cat: 'langue' },
  { word: 'METAPHORE',    clue: 'Figure de style par comparaison implicite', level: 7, cat: 'langue' },
  { word: 'OXYMORE',      clue: 'Alliance de termes contradictoires',       level: 7, cat: 'langue' },

  // ─── Niveau 9-10 : Mots experts ────────────────────────────────────────────
  { word: 'BIOLUMINESCENCE', clue: 'Émission de lumière par des organismes vivants', level: 9, cat: 'biologie' },
  { word: 'TAUTOLOGIE',      clue: 'Répétition inutile d\'une même idée',            level: 9, cat: 'langue' },
  { word: 'PLEONASME',       clue: 'Répétition d\'une idée déjà exprimée',           level: 9, cat: 'langue' },
  { word: 'ANACHRONISME',    clue: 'Erreur plaçant un fait dans une époque erronée', level: 9, cat: 'histoire' },
  { word: 'ESCHATOLOGIE',    clue: 'Doctrine des fins dernières de l\'humanité',     level: 9, cat: 'philosophie' },
  { word: 'EPISTEMOLOGIE',   clue: 'Philosophie de la connaissance scientifique',    level: 9, cat: 'philosophie' },
  { word: 'HERMENEUTIQUE',   clue: 'Science de l\'interprétation des textes',       level: 9, cat: 'philosophie' },
  { word: 'DIALECTIQUE',     clue: 'Méthode de raisonnement par thèse et antithèse', level: 9, cat: 'philosophie' },
  { word: 'PHENOMENOLOGIE',  clue: 'Étude des phénomènes de la conscience',         level: 9, cat: 'philosophie' },
  { word: 'ANTHROPOMORPHISME', clue: 'Attribution de traits humains aux animaux',   level: 9, cat: 'sciences' },
  { word: 'BIOLUMINESCENCE', clue: 'Production de lumière par le vivant',           level: 9, cat: 'biologie' },
  { word: 'THERMODYNAMIQUE', clue: 'Science de la chaleur et de l\'énergie',        level: 9, cat: 'physique' },
  { word: 'HYDRODYNAMIQUE',  clue: 'Étude des fluides en mouvement',                level: 9, cat: 'physique' },
  { word: 'ELECTROMAGNETISME', clue: 'Force physique unissant électricité et magnétisme', level: 9, cat: 'physique' },
  { word: 'QUASAR',          clue: 'Noyau galactique actif très lumineux',          level: 9, cat: 'astronomie' },
  { word: 'PULSAR',          clue: 'Étoile à neutrons émettant des pulsations',     level: 9, cat: 'astronomie' },
  { word: 'SUPERNOVA',       clue: 'Explosion cataclysmique d\'une étoile mourante', level: 9, cat: 'astronomie' },
  { word: 'ANTIMATIERE',     clue: 'Matière dont les particules ont charges opposées', level: 9, cat: 'physique' },
  { word: 'XENOPHOBE',       clue: 'Qui a peur ou méprise les étrangers',           level: 9, cat: 'sociologie' },
  { word: 'PHILANTHROPE',    clue: 'Personne qui aime l\'humanité et la soutient',  level: 9, cat: 'sociologie' },
];

/**
 * Retourne les mots compatibles avec un niveau de difficulté donné.
 * La plage s'élargit légèrement pour avoir suffisamment de mots.
 * @param {number} difficulty - Niveau 1 à 10
 * @param {number} count - Nombre de mots souhaités
 */
export function getWordsForDifficulty(difficulty, count) {
  // Définir la plage de niveaux selon la difficulté
  let minLevel, maxLevel;
  if (difficulty <= 2) {
    minLevel = 1; maxLevel = 2;
  } else if (difficulty <= 4) {
    minLevel = 1; maxLevel = 4;
  } else if (difficulty <= 6) {
    minLevel = 3; maxLevel = 6;
  } else if (difficulty <= 8) {
    minLevel = 5; maxLevel = 8;
  } else {
    minLevel = 7; maxLevel = 10;
  }

  // Filtrer et dédupliquer
  const pool = WORD_BANK.filter(
    (w) => w.level >= minLevel && w.level <= maxLevel && w.word.length >= 3
  );

  // Mélanger aléatoirement (Fisher-Yates)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Taille de grille recommandée selon la difficulté.
 */
export function getGridSize(difficulty) {
  if (difficulty <= 2) return 10;
  if (difficulty <= 4) return 11;
  if (difficulty <= 6) return 13;
  if (difficulty <= 8) return 15;
  return 15;
}

/**
 * Nombre de mots cibles selon la difficulté.
 */
export function getWordCount(difficulty) {
  if (difficulty <= 2) return 8;
  if (difficulty <= 4) return 11;
  if (difficulty <= 6) return 14;
  if (difficulty <= 8) return 18;
  return 22;
}
