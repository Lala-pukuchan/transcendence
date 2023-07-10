/*
  Warnings:

  - A unique constraint covering the columns `[fortyTwoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fortyTwoDiscriminator]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fortyTwoDiscriminator` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fortyTwoId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fortyTwoDiscriminator" TEXT NOT NULL,
ADD COLUMN     "fortyTwoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_fortyTwoId_key" ON "User"("fortyTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "User_fortyTwoDiscriminator_key" ON "User"("fortyTwoDiscriminator");
