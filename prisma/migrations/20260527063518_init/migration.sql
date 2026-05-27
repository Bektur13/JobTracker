/*
  Warnings:

  - You are about to drop the `Applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Applications";

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date_applied" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_id_key" ON "Application"("id");
