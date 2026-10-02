# Guide : construire un projet en dialoguant avec une IA

Ce document raconte comment ce projet a été construit, du dépôt vide au site publié, en dialoguant avec un assistant IA de code (Claude Code). Il en tire des conseils simples, réutilisables pour ton propre projet.

Il suit le cadre **« 4D »** du cours gratuit [AI Fluency: Framework & Foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations) d'Anthropic. Projet personnel, non affilié à Anthropic.

---

## 1. Les 4D en deux minutes

| Compétence | La question à se poser | Dans ce projet |
|---|---|---|
| **Délégation** | Qu'est-ce que je confie à l'IA, qu'est-ce que je garde ? | L'IA écrit le code et les textes ; je choisis la direction, le style et le moment de publier. |
| **Description** | Est-ce que j'explique clairement ce que je veux ? | Objectif, public, contraintes, sources fournies dès le départ. |
| **Discernement** | Est-ce que je vérifie ce que l'IA produit ? | Tests automatiques, sources contrôlées, relecture des textes, questions « pourquoi ? ». |
| **Diligence** | Est-ce que j'utilise l'IA de façon responsable ? | Validation avant toute publication, sources citées, ce guide et l'avertissement du README. |

---

## 2. Le déroulé réel, version par version

Chaque étape : **ce que j'ai demandé** (résumé), **ce que l'IA a fait**, **ce qu'on en retient**.

### Étape 0 : préparer le terrain
Un dépôt Git vide, et un fichier `docs/SOURCES.md` avec trois liens trouvés sur le sujet (un article scientifique, un fil Reddit, une page Wikipédia).

> **À retenir.** Donner des sources à l'IA, c'est lui donner du contexte. Elle part de ta matière au lieu d'inventer la sienne.

### v0.1 : le premier prompt
**Demande.** Un solveur de Rubik's Cube 3×3 simple et visuel, fondé sur la théorie des graphes et des « graphes imbriqués ». Il fallait aussi le relier aux mathématiques et à d'autres sciences. Techno au choix de l'IA, « va à l'essentiel », « un POC, je l'améliorerai ensuite ».

**Réponse de l'IA.**
- Elle a lu les sources et choisi une page web sans aucune dépendance.
- Elle a retenu l'algorithme de Kociemba, qui correspond exactement à « deux graphes emboîtés ».
- Elle a écrit un test automatique qui résout 20 cubes mélangés, avant même de montrer la page.
- Elle a vérifié le résultat dans un navigateur.

> **À retenir.** Un bon premier prompt contient un **objectif**, du **contexte** (les sources), des **contraintes** (POC, essentiel) et une **liberté explicite** là où tu n'as pas d'avis (la techno).
> Ce qui manquait : le **public visé**, la **cible de publication** (GitHub Pages) et le besoin **mobile**. Tout ça a été ajouté plus tard, au prix de retouches. Plus tu en dis tôt, moins tu refais.

### v0.2 : « fais moins IA » et « que proposerais-tu ? »
**Demande.** Un changelog, un commit, un visuel « plus nature, moins IA », et des idées d'amélioration.

**Réponse de l'IA.**
- Un journal des versions (`CHANGELOG.md`), et un commit sur une branche séparée plutôt que directement sur la branche principale.
- Une refonte façon article de maths (papier, typographie à empattements) au lieu des cartes arrondies typiques des interfaces générées.
- Une liste d'améliorations **classée**, avec une estimation de temps pour chacune.

> **À retenir.** Un ressenti (« ça fait trop IA ») est un retour valable : l'IA peut proposer une direction. Le style par défaut d'une IA n'est pas neutre, n'hésite pas à le challenger.
> Demander des propositions, c'est déléguer le tri des idées. **Le choix final reste le tien** : ici, 3D et saisie manuelle ont été repoussées volontairement.

### v0.3 : un texte pour un enfant, un autre pour un doctorant
**Demande.** Scinder la vue : à chaque étape, une explication simple et, en parallèle, une explication mathématique poussée (graphes, probabilités). Et une mise en ligne sur GitHub Pages.

**Réponse de l'IA.**
- Deux colonnes parallèles, calculées à chaque coup :
  - côté enfant : pièces tordues, pièces bien placées, une « boussole » ;
  - côté doctorant : coordonnées, bornes, histogrammes de probabilités.
- Elle a constaté que le dépôt était privé, et donc que Pages n'était pas disponible sans abonnement. Elle a expliqué les réglages à faire soi-même.
- Elle a **demandé confirmation avant de publier**.

> **À retenir.** **Décrire le public** est l'une des consignes les plus efficaces qui soient.
> Pour toute action visible publiquement (pousser du code, publier un site), c'est normal et souhaitable que l'IA demande d'abord.

### v0.4 : une vraie question de fond
**Demande.** Plus de sources. « Le mélange se fait en un nombre fini de coups : est-ce que ça change le résultat ? » Et pouvoir dévier du chemin de résolution pour voir ce qui se passe.

**Réponse de l'IA.**
- Elle a répondu à la question : pas d'effet sur la solution, mais un effet sur les positions obtenues. Elle a ajouté cette explication dans la page.
- Elle a **vérifié chaque nouvelle source** (liens et identifiants DOI) avant de la citer.
- Elle a ajouté les « détours » : forcer un autre coup et comparer. Ils peuvent même révéler que la solution initiale n'était pas la plus courte.

> **À retenir.** Pose aussi des **questions de fond**, pas seulement des demandes de fonctionnalités : c'est là que tu apprends.
> **Exige des sources vérifiables.** Une IA peut inventer une référence qui a l'air vraie ; ici, chaque lien a été testé.

### v0.5 : trois demandes d'un coup
**Demande.** Une vue 3D des mouvements avec explications, pouvoir colorier son propre cube, et un parallèle avec une autre application du même principe.

**Réponse de l'IA.**
- Un cube 3D animé, avec un test automatique qui vérifie que chaque rotation 3D correspond au modèle mathématique.
- Un coloriage qui explique pourquoi un cube est impossible (« un coin est tordu sur place »).
- Un parallèle avec le taquin et le GPS.

> **À retenir.** Plusieurs demandes dans un même message fonctionnent si chacune est claire.
> Préfère les **vérifications automatiques** aux vérifications « à l'œil » : elles se relancent à chaque modification.

### v0.6 : la qualité du code aussi, ça se demande
**Demande.** Découper le code en plusieurs fichiers (« pas de monolithe »), et adapter l'affichage aux téléphones et tablettes.

**Réponse de l'IA.**
- Des modules séparés, avec une CSS à part.
- Sur mobile : un sélecteur « en clair / en détail / les deux » et une barre de navigation fixe.
- Elle a **signalé un effet de bord** : le site ne s'ouvre plus par simple double-clic, il faut un petit serveur local.

> **À retenir.** L'architecture du code fait partie de la commande, dis-le si ça compte pour toi. Vérifie que l'IA annonce les conséquences de ses choix : c'est un signe de travail sérieux.

### v0.7 : dire ce qui ne va pas, pas comment le réparer
**Demande.** « On ne comprend pas la relation entre le cube et le graphe. »

**Réponse de l'IA.**
- Elle a dessiné les sommets du graphe comme de vrais cubes : le chemin cube par cube, les 18 voisins d'une position, et de petits graphes complets.
- Elle a **proposé la 2D plutôt que la 3D, en expliquant pourquoi**.

> **À retenir.** Décrire le **problème vu par l'utilisateur** (« on ne comprend pas… ») donne souvent de meilleures solutions que de prescrire la solution. L'IA propose, tu arbitres.

---

## 3. Ce que l'IA a mal fait, et comment on l'a vu

- **Une affirmation mathématique inexacte** dans un texte généré. Elle a été repérée à la relecture et corrigée.
- **Une numérotation de références décalée** après un ajout, corrigée ensuite.
- **Des captures d'écran qui échouaient** souvent. L'IA l'a dit clairement au lieu de prétendre avoir tout vérifié visuellement, et a vérifié autrement (tests, lecture de la page).
- **Un premier visuel « trop IA »** : le style par défaut a dû être challengé.
- **Cinq points relevés par une seconde IA** à la relecture du contenu mathématique : des compteurs incohérents (« coins tordus » qui montent à côté d'« arêtes retournées » qui baissent), une métaphore présentée comme un théorème (Noether), une borne de 30 coups vraie seulement si chaque phase est optimale, une phrase vague sur le mélange à 25 coups, et un diamètre non confirmé. Ce dernier a été vérifié en relançant le calcul (96 états, diamètre 10). Tout est corrigé en 0.7.2.

> **Discernement.** Relis, teste, et demande « qu'as-tu vérifié, et comment ? ». Une IA honnête te dira aussi ce qu'elle n'a **pas** pu vérifier.

---

## 4. Conseils pour ton propre projet

**Délégation**
1. Commence par un **POC** minimal, puis avance par **petites versions** (ici : 0.1 → 0.7).
2. Garde pour toi les décisions qui engagent : le style, le public, **la publication**.

**Description**

3. Dans ton premier message, donne : l'objectif, le public, les contraintes, le contexte (fichiers, sources), ce que tu **ne** veux **pas**, et où ça sera publié.
4. Décris les problèmes comme tu les ressens (« on ne comprend pas », « ça fait trop IA ») ; demande des propositions classées.

**Discernement**

5. Exige des **tests automatiques** et des **sources vérifiées**.
6. Pose des questions de fond (« est-ce que X a une incidence ? ») : l'IA doit expliquer, pas seulement coder.

**Diligence**

7. Relis avant de publier. Ne mets jamais de données sensibles dans un prompt ou un dépôt public.
8. Sois transparent sur l'usage de l'IA (comme l'avertissement du README).

**Outils**

9. Un journal des versions (`CHANGELOG.md`) et un commit par version : tu peux toujours revenir en arrière.
10. Dans Claude Code, un fichier `CLAUDE.md` à la racine du projet peut fixer des règles durables (style, commandes de test, conventions), pour ne pas les répéter à chaque message.

---

## 5. Modèle de premier prompt

À copier et adapter :

```text
Contexte : [ton projet en 2 phrases]. J'ai mis mes sources dans [chemin du fichier].

Objectif : [ce que tu veux obtenir, concrètement].
Public : [qui va l'utiliser : enfants, experts, les deux…].
Contraintes : [POC / production, technos imposées ou libres, pas de dépendances…].
Je ne veux pas : [ce qui est hors sujet ou à éviter].
Publication : [local seulement / GitHub Pages / autre] ; [ordinateur, mobile, les deux].

Pour cette première version : [périmètre précis].
Vérifie ton travail avec des tests, cite tes sources, et demande-moi avant
toute action irréversible ou publique (push, publication).
Termine par une liste d'améliorations possibles, classées.
```

---

## 6. Pour aller plus loin (ressources Anthropic)

- [Anthropic Academy](https://www.anthropic.com/learn) : tous les cours.
- [AI Fluency: Framework & Foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations) : le cadre 4D, avec un certificat de fin de cours.
- [Prompt engineering overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) : les techniques de prompt.
- [Claude Code best practices](https://www.anthropic.com/engineering/claude-code-best-practices) : bien travailler avec un assistant de code.
