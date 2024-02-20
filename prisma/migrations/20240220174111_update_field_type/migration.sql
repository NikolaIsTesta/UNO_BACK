/*
  Warnings:

  - The `deck` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `spentCards` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentCards` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "deck",
ADD COLUMN     "deck" JSONB[],
DROP COLUMN "spentCards",
ADD COLUMN     "spentCards" JSONB[],
DROP COLUMN "currentCards",
ADD COLUMN     "currentCards" JSONB[];
