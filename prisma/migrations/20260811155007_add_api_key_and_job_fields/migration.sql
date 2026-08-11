-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "salaryRange" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

