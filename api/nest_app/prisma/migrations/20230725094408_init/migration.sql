/*
  Warnings:

  - You are about to drop the column `achievements` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserMatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserMatch" DROP CONSTRAINT "_UserMatch_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserMatch" DROP CONSTRAINT "_UserMatch_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "achievements";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "_UserMatch";
