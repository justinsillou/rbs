# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [0.7.2] - 2026-10-02

### Corrigé
- Compteurs de la mission 1 homogénéisés : tout est exprimé en pièces « bien orientées / bien placées », les chiffres et les barres montent ensemble.
- « Analogue discret du théorème de Noether » précisé comme une image (homomorphismes vers un groupe abélien), pas un énoncé de Noether.
- Borne de 30 coups (12 + 18) : valable seulement si chaque phase est optimale ; le budget de 500 ms de la page peut l'empêcher.
- Phrase vague sur le mélange à 25 coups remplacée par un énoncé qui ne dit que ce qui est mesuré.

### Documentation
- `docs/PROMPTING.md` : relecture croisée par une seconde IA ajoutée aux erreurs rencontrées. Diamètre 10 de ⟨U2, D2, R2⟩ confirmé par BFS (96 états).

## [0.7.1] - 2026-09-28

### Documentation
- Avertissement en tête du README : dépôt d'apprentissage du prompting et de l'usage réfléchi de l'IA (recommandations Anthropic, cadre AI Fluency « 4D »), non affilié à Anthropic.
- `docs/PROMPTING.md` : le déroulé du projet version par version (demande → réponse de l'IA → leçon), les erreurs rencontrées, des conseils classés selon les 4D, un modèle de premier prompt et des liens vers les cours.

## [0.7.0] - 2026-09-28

### Ajouté
- Section « Le graphe vu de près : chaque sommet est un cube », où les sommets sont dessinés comme de vrais cubes (mini-cubes isométriques) :
  - pellicule du chemin de résolution, cube par cube, avec les mouvements en flèches (cliquable) ;
  - voisinage réel de l'état courant : ses 18 voisins en un coup, colorés selon le progrès, avec les triangles R/R2/R′ qui montrent que le graphe n'est pas un arbre (cliquer un voisin = avancer, reculer ou forcer un détour) ;
  - petits graphes complets (⟨U⟩, ⟨R2, U2⟩, ⟨U, D⟩, ⟨U2, D2, R2⟩ : 4 à 96 états) disposés par sphères BFS, avec le plus court chemin vers le résolu et un bouton pour charger l'état dans le cube 3D.
- Textes associés aux deux niveaux (en clair / en détail : boule de rayon 1, K₄ par face, sphères 1, 18, 243, 3 240, groupes ℤ₄, D₆, ℤ₄ × ℤ₄).

## [0.6.0] - 2026-09-28

### Modifié
- Code découpé en modules ES : modèle (`src/cube.js`), solveur (`src/solver.js`), application (`src/app.js`) et un module par vue (`src/ui/` : patron, cube 3D, graphe, textes, formats) ; CSS dans `css/style.css`. `index.html` ne contient plus que le balisage.
- Le site se sert désormais par HTTP (GitHub Pages ou `python -m http.server`) : les modules ne se chargent pas en `file://`.

### Ajouté
- Responsive tablette (cube et graphe empilés) et téléphone : un niveau de lecture à la fois (en clair / en détail / les deux), barre d'étapes fixée en bas de l'écran, zones tactiles agrandies (voisins du graphe, boutons), tableau comparatif défilant.

## [0.5.0] - 2026-09-28

### Ajouté
- Vue 3D du cube (CSS 3D, sans bibliothèque) : coups animés pas à pas (avant et arrière), face à tourner encadrée, caméra qui pivote si cette face est cachée, rotation libre à la souris. Chaque coup est décrit en mots, avec un rappel de la notation.
- Coloriage : recopier son propre cube sur le patron, avec validation des trois invariants et message explicite en cas de cube impossible (coin tordu, arête retournée, pièces échangées, couleur en trop).
- Parallèle avec le taquin et le GPS : même graphe d'états, même « boussole » admissible, mêmes graphes emboîtés ; tableau comparatif et 5 références supplémentaires (A*, Johnson & Story, bases de motifs, hiérarchies de contraction, diamètre du taquin).

## [0.4.0] - 2026-09-25

### Ajouté
- Détours : à n'importe quelle étape, forcer un autre coup (clic sur un voisin du graphe ou sur un mouvement). Le solveur recalcule la suite ; la page affiche l'écart Δ de longueur et signale les contre-exemples à l'optimalité (Δ < 0 ou Δ > 2) et les sorties de G₁.
- Longueur de mélange réglable et bouton « état aléatoire » (tirage uniforme dans G₀ sous les trois invariants, comme en compétition WCA).
- Sections « Le mélange compte-t-il ? » / « Mélange fini et marche aléatoire » et « Et si on sort du chemin ? » / « Détours et contre-exemples ».
- 10 références supplémentaires (Korf, Korf-Reid-Edelkamp, DeepCubeA, Diaconis, Joyner, Thistlethwaite, WCA, superflip…).

### Modifié
- Sur le graphe, la distance au centre représente maintenant la borne *h* de l'état (et non plus sa position dans la phase), ce qui permet de montrer un chemin qui ressort de G₁.

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
