# Rubik's Graph Solver

Solveur de Rubik's Cube 3×3 visuel, basé sur la théorie des graphes : la résolution est un plus court chemin dans **deux graphes imbriqués** (algorithme à deux phases de Kociemba).

- Phase 1 : chemin dans le graphe quotient G₀/G₁ (G₁ = ⟨U, D, R2, F2, L2, B2⟩), 18 mouvements.
- Phase 2 : chemin dans le graphe de Cayley de G₁, 10 mouvements.
- Heuristique : distances exactes calculées par BFS sur des projections du graphe (tables de ~1 M nœuds), utilisées par IDA*.

La page montre le cube (patron), le chemin sous forme de spirale G₀ → G₁ → résolu, et pour chaque étape le **graphe local** : les voisins de l'état courant, colorés selon que le mouvement rapproche ou éloigne de la cible.

Chaque étape est expliquée à deux niveaux, en parallèle : **En clair** (ce qui change sur le cube, pour tout le monde) et **En détail** (graphe de Schreier / Cayley, coordonnées, bornes IDA*, distributions de distances et probabilités).

À tout moment, on peut **forcer un autre coup** (clic sur un voisin du graphe ou sur un mouvement) : le solveur recalcule la suite et la page montre ce que coûte le détour, avec les contre-exemples à l'optimalité quand il y en a. On peut aussi choisir la longueur du mélange ou tirer un **état aléatoire** uniforme.

Le cube est affiché en **3D** : chaque coup est animé et décrit en mots. On peut aussi **colorier** son propre cube sur le patron ; la page vérifie qu'il est réalisable (trois invariants) et explique sinon pourquoi. Une section « le graphe vu de près » dessine les sommets comme de vrais cubes : le chemin cube par cube, les 18 voisins de l'état courant, et des petits graphes complets explorés par BFS. Une dernière partie fait le parallèle avec le **taquin** et le **GPS**, qui reposent sur le même principe de recherche.

**Démo :** https://justinsillou.github.io/rbs/

## Déployer (GitHub Pages)

Site 100 % statique, rien à compiler. Sur GitHub : *Settings → Pages → Source : Deploy from a branch → `main` / `(root)`*. La page est publiée à l'adresse ci-dessus ; pour un portfolio, un lien ou une `<iframe src="https://justinsillou.github.io/rbs/">` suffit.

## Lancer en local

Pas de build, pas de dépendance. Le code est en modules ES : il faut servir le dossier (ouvrir `index.html` directement en `file://` ne charge pas les modules) :

```bash
python -m http.server 8000
```

puis ouvrir http://localhost:8000. La page est utilisable sur ordinateur, tablette et téléphone.

## Tester

```bash
node test.js
```

Vérifie le modèle (mouvements, couleurs ↔ cube, invariants, géométrie 3D) et résout 20 mélanges et 5 états aléatoires (~21 coups en moyenne).

## Fichiers

```
index.html           balisage et contenu (théorie, références)
css/style.css        styles, thème clair/sombre, responsive
src/cube.js          modèle : mouvements, couleurs, invariants, géométrie 3D
src/solver.js        coordonnées, tables BFS, IDA* deux phases, voisinage local
src/app.js           état de l'application et câblage des commandes
src/ui/format.js     vocabulaire français, couleurs, formats de nombres
src/ui/net.js        patron 2D
src/ui/cube3d.js     cube 3D (CSS 3D), animation, rotation à la souris / au doigt
src/ui/graph.js      graphes imbriqués, chemin, voisinage de l'étape courante
src/ui/explain.js    textes par étape « en clair » / « en détail »
src/ui/minicube.js   mini-cube isométrique (un sommet du graphe dessiné comme un cube)
src/ui/closeup.js    pellicule du chemin et voisinage réel de l'état courant
src/ui/explorer.js   petits sous-groupes dont le graphe complet tient à l'écran
test.js              auto-vérification Node
```

## Sources

Voir [docs/SOURCES.md](docs/SOURCES.md).
