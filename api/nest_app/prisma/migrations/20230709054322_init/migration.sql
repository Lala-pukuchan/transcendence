-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discriminator" TEXT NOT NULL DEFAULT '0000';
