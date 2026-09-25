# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [0.3.0] - 2026-09-25

### Ajouté
- Vue en deux colonnes parallèles : « En clair » (enfant) et « En détail » (doctorant), à chaque étape et dans la théorie.
- Par étape, en clair : coup décrit en mots, effet sur le cube (coins tordus, arêtes retournées, pièces à leur place, couleurs à leur place), boussole *h*, explication des coups « neutres ».
- Par étape, en détail : coordonnées du sommet, distances projetées *d*<sub>A</sub>, *d*<sub>B</sub>, borne IDA* *f* = *g* + *h*, statistiques du voisinage et probabilité de progrès, histogrammes des distances des graphes projetés (P(*d*), E[*d*]), invariant de parité en phase 2.
- Nombre de nœuds explorés par IDA* (`solve().nodes`).
- Publication GitHub Pages documentée dans le README.

## [0.2.0] - 2026-09-25

### Modifié
- Refonte visuelle façon article de mathématiques interactif : papier, typographie serif, figure légendée, commandes en texte, couleurs « encre » (clair et sombre).
- Partie théorique réécrite en prose, avec références numérotées vers les sources.
- Patron du cube avec corps noir et couleurs de stickers plus réalistes ; notation des mouvements avec prime typographique (R′).

## [0.1.0] - 2026-09-25

### Ajouté
- Modèle du cube (cubies, 18 mouvements, rendu en patron).
- Solveur deux phases de Kociemba : IDA* guidé par 4 tables de distances construites par BFS sur des projections du graphe (~1 s au chargement, ~21 coups en moyenne).
- Visualisation des graphes imbriqués G₀ ⊃ G₁ ⊃ {résolu} : chemin de résolution en spirale, graphe local (voisins colorés selon l'heuristique) à chaque étape, navigation pas à pas.
- Section théorique : groupe du cube, graphe de Cayley, sous-groupes emboîtés, heuristique, liens avec d'autres sciences.
- Auto-test Node (`node test.js`).
