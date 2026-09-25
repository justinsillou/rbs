# Rubik's Graph Solver

Solveur de Rubik's Cube 3×3 visuel, basé sur la théorie des graphes : la résolution est un plus court chemin dans **deux graphes imbriqués** (algorithme à deux phases de Kociemba).

- Phase 1 : chemin dans le graphe quotient G₀/G₁ (G₁ = ⟨U, D, R2, F2, L2, B2⟩), 18 mouvements.
- Phase 2 : chemin dans le graphe de Cayley de G₁, 10 mouvements.
- Heuristique : distances exactes calculées par BFS sur des projections du graphe (tables de ~1 M nœuds), utilisées par IDA*.

La page montre le cube (patron), le chemin sous forme de spirale G₀ → G₁ → résolu, et pour chaque étape le **graphe local** : les voisins de l'état courant, colorés selon que le mouvement rapproche ou éloigne de la cible.

## Lancer

Pas de build, pas de dépendance. Ouvrir `index.html` dans un navigateur, ou le servir :

```bash
python -m http.server 8000
```

puis ouvrir http://localhost:8000.

## Tester

```bash
node test.js
```

Vérifie le modèle (mouvements, facettes) et résout 20 mélanges aléatoires (~21 coups en moyenne, ~0,3 s chacun).

## Fichiers

- `cube.js` : modèle cubie, coordonnées, tables (BFS), solveur IDA* deux phases, voisinage local.
- `index.html` : interface et visualisation (SVG, JS natif).
- `test.js` : auto-vérification Node.

## Sources

Voir [docs/SOURCES.md](docs/SOURCES.md).
