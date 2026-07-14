# Stock ReadyMiix Cabana

Application privée de préparation du stand ReadyMiix Cabana avant le service
du soir (18 h–00 h). Trois postes fixes (Bar & Caïpis, Cuisine, Accueil &
Boissons) clôturent chaque soir leur stock restant ; l'écart avec la
quantité cible génère automatiquement la liste unique à préparer avant
16 h, cochée par Allan/Talia, qui déduit le stock du dépôt en temps réel.

## Stack technique

- **Next.js 16** (App Router, Server Actions) + TypeScript
- **Tailwind CSS v4** pour le design (thème tropical)
- **Prisma + PostgreSQL** pour la base de données, avec migrations versionnées
  (`prisma/migrations`), appliquées automatiquement au build (`prisma migrate
  deploy`).
- **Authentification maison** : session JWT (cookie httpOnly) via `jose`,
  connexion par e-mail + code personnel (PIN) haché avec `bcryptjs`.
  Deux rôles : `ADMIN` (Allan et Talia, accès complet) et `EMPLOYEE`
  (accès uniquement au poste dont il/elle est responsable).

## Démarrage (développement local)

Nécessite une base PostgreSQL accessible (locale ou hébergée gratuitement,
ex. [Neon](https://neon.tech), [Supabase](https://supabase.com)).

```bash
npm install
cp .env.example .env   # renseigner DATABASE_URL et SESSION_SECRET
npm run db:migrate     # applique les migrations sur la base
npm run db:seed        # crée les postes, produits et comptes
npm run dev
```

L'application est accessible sur http://localhost:3000.

### Comptes (à changer en production)

| Rôle | Nom | E-mail | Code |
| --- | --- | --- | --- |
| Admin | Allan | persaudallan@gmail.com | 1234 |
| Admin | Talia | talia@readymiixcabana.com | 1111 |
| Admin | Nathalie | nathalie@readymiixcabana.com | 4444 |
| Admin | Joël | joel@readymiixcabana.com | 5555 |
| Employé — Bar & Caïpis | Grenadine | grenadine@readymiixcabana.com | 2001 |
| Employé — Cuisine | Océane | oceane@readymiixcabana.com | 2002 |
| Employé — Accueil & Boissons | Cynthia | cynthia@readymiixcabana.com | 2003 |

Changez ces codes en production depuis **Utilisateurs** (réservée aux
admins). Pour changer qui est responsable d'un poste (ex. remplacer
Cynthia), utilisez **Paramètres** — cela ne touche ni aux produits, ni aux
quantités, ni à l'historique du poste.

## Fonctionnement

1. **Clôture du poste (employé)** — sur `/inventaire`, l'employé saisit la
   quantité restante de chaque produit de son poste (boutons +/-, ou saisie
   directe) et valide. L'écart avec la quantité cible ("à remettre") est
   calculé automatiquement et alimente la liste de préparation du jour.
2. **Préparation (Allan/Talia)** — `/preparation` regroupe par poste tous
   les produits à remettre. Chaque produit coché est retiré du stock du
   dépôt ; si le dépôt n'a pas assez, le produit est signalé "Stock dépôt
   insuffisant". Une fois tout coché, le bouton **Stand prêt pour le
   service** valide la journée.
3. **Dépôt** — `/depot` permet de consulter/ajuster le stock disponible au
   dépôt, et affiche la liste des produits à acheter (stock dépôt
   insuffisant pour couvrir le besoin du jour).
4. **Tableau de bord** — vue d'ensemble : inventaires terminés (X/3),
   produits à remettre, restant à préparer, statut (Non commencé / En
   cours / Prêt).

Sont également disponibles : gestion des produits par poste (`/stock`,
admins), historique des mouvements (`/historique`), gestion des pertes
(`/pertes`), gestion des utilisateurs et des postes (`/utilisateurs`,
`/parametres`).

## Notes d'architecture

- Chaque poste (`Poste`) a un responsable (`responsibleId`) réassignable à
  tout moment sans impact sur les produits, quantités ou l'historique — les
  employés n'ont accès qu'au(x) poste(s) dont ils sont responsables.
- `StockMovement` reste la source de vérité de l'historique des quantités
  (entrées, sorties, pertes, inventaires).
- `PrepItem` matérialise, pour une date donnée, l'écart à remettre par
  produit ; il est régénéré à chaque clôture de poste et coché lors de la
  préparation (avec déduction/restauration du stock dépôt).
- `ServiceDay` enregistre la validation finale ("Stand prêt") du jour.

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
4. **Initialiser les données** (sans risque à rejouer) :
   - Définir temporairement la variable d'environnement `SEED_TOKEN` (une
     valeur secrète de votre choix) sur Vercel et redéployer.
   - Visiter `https://votre-app.vercel.app/api/seed?token=VOTRE_SEED_TOKEN`
     une fois : cela crée/met à jour les postes, produits de démonstration
     et comptes utilisateurs (voir tableau ci-dessus).
   - Supprimer la variable `SEED_TOKEN` une fois l'initialisation faite.
