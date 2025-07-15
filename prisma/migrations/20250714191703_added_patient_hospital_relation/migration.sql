/*
  Warnings:

  - Added the required column `hospitalId` to the `PATIENT` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PATIENT" ADD COLUMN     "hospitalId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PATIENT" ADD CONSTRAINT "PATIENT_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HOSPITAL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
