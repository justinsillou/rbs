# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [0.1.0] - 2026-09-25

### Ajouté
- Modèle du cube (cubies, 18 mouvements, rendu en patron).
- Solveur deux phases de Kociemba : IDA* guidé par 4 tables de distances construites par BFS sur des projections du graphe (~1 s au chargement, ~21 coups en moyenne).
- Visualisation des graphes imbriqués G₀ ⊃ G₁ ⊃ {résolu} : chemin de résolution en spirale, graphe local (voisins colorés selon l'heuristique) à chaque étape, navigation pas à pas.
- Section théorique : groupe du cube, graphe de Cayley, sous-groupes emboîtés, heuristique, liens avec d'autres sciences.
- Auto-test Node (`node test.js`).
