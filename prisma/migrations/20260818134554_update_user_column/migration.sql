/*
  Warnings:

  - A unique constraint covering the columns `[connectedCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "connecteCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "connectedCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_connectedCode_key" ON "User"("connectedCode");
