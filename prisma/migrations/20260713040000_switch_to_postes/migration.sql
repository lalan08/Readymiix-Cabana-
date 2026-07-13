-- Clear placeholder demo data from the pre-pivot version of the app (generic
-- categories/products). There is no real business history to preserve yet,
-- and the new poste-based model requires posteId to be NOT NULL, which
-- can't be backfilled meaningfully for the old rows.
TRUNCATE TABLE "StockMovement", "Loss", "InventoryLine", "InventorySession", "Product" CASCADE;

-- AlterEnum
BEGIN;
CREATE TYPE "MovementType_new" AS ENUM ('ENTREE', 'SORTIE', 'PERTE', 'INVENTAIRE', 'CREATION');
ALTER TABLE "StockMovement" ALTER COLUMN "type" TYPE "MovementType_new" USING ("type"::text::"MovementType_new");
ALTER TYPE "MovementType" RENAME TO "MovementType_old";
ALTER TYPE "MovementType_new" RENAME TO "MovementType";
DROP TYPE "public"."MovementType_old";
COMMIT;

-- The MANAGER role no longer exists; fold any such accounts into ADMIN
-- before the enum is narrowed so the cast below can't fail.
UPDATE "User" SET "role" = 'ADMIN' WHERE "role" = 'MANAGER';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'EMPLOYEE');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Unit_new" AS ENUM ('BOUTEILLE', 'SAC_5KG', 'KILOGRAMME', 'LITRE', 'PIECE', 'PAQUET', 'CARTON', 'PORTION', 'BOWL', 'CANETTE');
ALTER TABLE "public"."Product" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "unit" TYPE "Unit_new" USING ("unit"::text::"Unit_new");
ALTER TYPE "Unit" RENAME TO "Unit_old";
ALTER TYPE "Unit_new" RENAME TO "Unit";
DROP TYPE "public"."Unit_old";
ALTER TABLE "Product" ALTER COLUMN "unit" SET DEFAULT 'PIECE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_siteId_fkey";

-- DropForeignKey
ALTER TABLE "ReplenishmentItem" DROP CONSTRAINT "ReplenishmentItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_siteId_fkey";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- AlterTable
ALTER TABLE "InventorySession" DROP COLUMN "notes",
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "posteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId",
DROP COLUMN "idealQuantity",
DROP COLUMN "location",
DROP COLUMN "minQuantity",
DROP COLUMN "purchasePrice",
DROP COLUMN "siteId",
DROP COLUMN "supplier",
ADD COLUMN     "depotQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "groupe" TEXT,
ADD COLUMN     "posteId" TEXT NOT NULL,
ADD COLUMN     "targetQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "siteId";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "ReplenishmentItem";

-- DropTable
DROP TABLE "Site";

-- DropEnum
DROP TYPE "ReplenishmentStatus";

-- DropEnum
DROP TYPE "StockStatus";

-- DropEnum
DROP TYPE "Urgency";

-- CreateTable
CREATE TABLE "Poste" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "responsibleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepItem" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "productId" TEXT NOT NULL,
    "posteId" TEXT NOT NULL,
    "quantityNeeded" DOUBLE PRECISION NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),
    "checkedById" TEXT,
    "depotDeducted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PrepItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceDay" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "readyAt" TIMESTAMP(3),
    "readyById" TEXT,

    CONSTRAINT "ServiceDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Poste_name_key" ON "Poste"("name");

-- CreateIndex
CREATE INDEX "PrepItem_date_idx" ON "PrepItem"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PrepItem_date_productId_key" ON "PrepItem"("date", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDay_date_key" ON "ServiceDay"("date");

-- CreateIndex
CREATE INDEX "InventorySession_posteId_date_idx" ON "InventorySession"("posteId", "date");

-- CreateIndex
CREATE INDEX "Product_posteId_idx" ON "Product"("posteId");

-- AddForeignKey
ALTER TABLE "Poste" ADD CONSTRAINT "Poste_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "Poste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySession" ADD CONSTRAINT "InventorySession_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "Poste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepItem" ADD CONSTRAINT "PrepItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepItem" ADD CONSTRAINT "PrepItem_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "Poste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrepItem" ADD CONSTRAINT "PrepItem_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDay" ADD CONSTRAINT "ServiceDay_readyById_fkey" FOREIGN KEY ("readyById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

