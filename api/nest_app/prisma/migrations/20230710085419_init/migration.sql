/*
  Warnings:

  - You are about to drop the column `fortyTwoDiscriminator` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_fortyTwoDiscriminator_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fortyTwoDiscriminator";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");
