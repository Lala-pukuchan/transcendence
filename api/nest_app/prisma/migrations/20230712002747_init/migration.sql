-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorSecret" TEXT DEFAULT 'default-secret';
