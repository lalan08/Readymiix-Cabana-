# Stock ReadyMiix Cabana

Application privée de gestion du stock et du réapprovisionnement du stand
ReadyMiix Cabana. Pensée mobile-first pour être utilisée rapidement sur
téléphone pendant le service.

## Stack technique

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS v4** pour le design (thème tropical)
- **Prisma + SQLite** pour la base de données (fichier `prisma/dev.db`).
  Le schéma est compatible PostgreSQL/MySQL : il suffit de changer le
  `provider` et la variable `DATABASE_URL` pour migrer vers une base de
  production partagée.
- **Authentification maison** : session JWT (cookie httpOnly) via `jose`,
  connexion par e-mail + code personnel (PIN) haché avec `bcryptjs`.
  Les rôles (`ADMIN`, `MANAGER`, `EMPLOYEE`) contrôlent l'accès aux pages
  sensibles (utilisateurs, paramètres).

## Démarrage

```bash
npm install
cp .env.example .env   # puis personnaliser SESSION_SECRET
npm run db:push        # crée la base SQLite à partir du schéma Prisma
npm run db:seed        # crée les catégories, produits de démo et comptes
npm run dev
```

L'application est accessible sur http://localhost:3000.

### Comptes de démonstration (à changer en production)

| Rôle          | E-mail                              | Code |
| ------------- | ------------------------------------ | ---- |
| Administrateur | persaudallan@gmail.com              | 1234 |
| Responsable    | responsable@readymiixcabana.com     | 2345 |
| Employé        | employe@readymiixcabana.com         | 3456 |

Changez ces codes dès la mise en production depuis la page **Utilisateurs**
(réservée à l'administrateur).

## Fonctionnalités principales (V1)

1. **Voir le stock** — page Stock complet avec filtres par catégorie,
   statut et recherche, statuts visuels (vert / orange / rouge / bleu).
2. **Mettre à jour les quantités** — boutons +/-, saisie directe, signaler
   une rupture, ajouter au réapprovisionnement, depuis chaque fiche produit.
3. **Générer la liste de réapprovisionnement** — liste automatique des
   produits sous le seuil minimum, sélection multiple, changement de statut
   (à préparer → à acheter → en cours → prêt → transféré → terminé), et
   génération d'une liste de préparation partageable par WhatsApp, copiable,
   imprimable ou exportable en PDF.

Sont également disponibles : inventaire de fermeture, historique des
mouvements (avec filtres produit/catégorie/personne/période), gestion des
pertes (casse, péremption, offert...), gestion des utilisateurs et des
catégories.

## Notes d'architecture

- Un modèle `Site` existe déjà dans le schéma pour préparer l'ajout de
  plusieurs points de stock ReadyMiix à l'avenir sans revoir la structure
  des données.
- Les mouvements de stock (`StockMovement`) constituent la source de vérité
  de l'historique ; chaque entrée, sortie, perte, réapprovisionnement ou
  ajustement d'inventaire y est journalisé avec l'utilisateur, l'ancienne et
  la nouvelle quantité.
- La liste de réapprovisionnement (`ReplenishmentItem`) est resynchronisée
  automatiquement à chaque chargement du tableau de bord et de la page
  Réapprovisionnement à partir des niveaux de stock réels.

## Déploiement

Pour un déploiement en production réel (accès multi-appareils, données
partagées en temps réel), il est recommandé de :

1. Remplacer SQLite par une base PostgreSQL managée (ex. Vercel Postgres,
   Neon, Supabase) — seule la variable `DATABASE_URL` et le `provider` du
   `schema.prisma` changent.
2. Définir un `SESSION_SECRET` long et aléatoire dans les variables
   d'environnement de production.
3. Déployer sur Vercel ou tout hébergeur compatible Next.js.
