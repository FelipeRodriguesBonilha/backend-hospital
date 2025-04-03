/*
  Warnings:

  - You are about to drop the column `role` on the `USER` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `USER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "USER" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ROLE" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ROLE_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ROLE_name_key" ON "ROLE"("name");

-- AddForeignKey
ALTER TABLE "USER" ADD CONSTRAINT "USER_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "ROLE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
