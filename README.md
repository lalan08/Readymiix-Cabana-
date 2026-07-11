# Stock ReadyMiix Cabana

Application privée de gestion du stock et du réapprovisionnement du stand
ReadyMiix Cabana. Pensée mobile-first pour être utilisée rapidement sur
téléphone pendant le service.

## Stack technique

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS v4** pour le design (thème tropical)
- **Prisma + PostgreSQL** pour la base de données, avec migrations versionnées
  (`prisma/migrations`), appliquées automatiquement au build (`prisma migrate
  deploy`).
- **Authentification maison** : session JWT (cookie httpOnly) via `jose`,
  connexion par e-mail + code personnel (PIN) haché avec `bcryptjs`.
  Les rôles (`ADMIN`, `MANAGER`, `EMPLOYEE`) contrôlent l'accès aux pages
  sensibles (utilisateurs, paramètres).

## Démarrage (développement local)

Nécessite une base PostgreSQL accessible (locale ou hébergée gratuitement,
ex. [Neon](https://neon.tech), [Supabase](https://supabase.com)).

```bash
npm install
cp .env.example .env   # renseigner DATABASE_URL et SESSION_SECRET
npm run db:migrate     # applique les migrations sur la base
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

## Déploiement (ex. Vercel)

1. **Créer une base PostgreSQL** — depuis le tableau de bord Vercel, onglet
   *Storage* → *Create Database* (intégration Neon ou Vercel Postgres). En la
   connectant au projet, Vercel injecte automatiquement `DATABASE_URL` (ou
   une variable équivalente ; renommez-la `DATABASE_URL` si besoin dans les
   paramètres du projet).
2. **Définir `SESSION_SECRET`** dans Project Settings → Environment Variables
   — une longue chaîne aléatoire (ex. générée avec
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
3. **Déployer.** La commande de build (`prisma migrate deploy && next build`)
   applique automatiquement les migrations à chaque déploiement.
4. **Initialiser les données** (une seule fois, sur une base vide) :
   - Définir temporairement la variable d'environnement `SEED_TOKEN` (une
     valeur secrète de votre choix) sur Vercel et redéployer.
   - Visiter `https://votre-app.vercel.app/api/seed?token=VOTRE_SEED_TOKEN`
     une fois : cela crée les catégories, produits de démonstration et
     comptes utilisateurs (voir tableau ci-dessus). L'appel est sans effet
     si la base contient déjà des utilisateurs.
   - Supprimer la variable `SEED_TOKEN` une fois l'initialisation faite.
