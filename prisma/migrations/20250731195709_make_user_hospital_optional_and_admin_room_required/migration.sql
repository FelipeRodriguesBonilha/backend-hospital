/*
  Warnings:

  - Made the column `adminId` on table `ROOM` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ROOM" DROP CONSTRAINT "ROOM_adminId_fkey";

-- DropForeignKey
ALTER TABLE "USER" DROP CONSTRAINT "USER_hospitalId_fkey";

-- AlterTable
ALTER TABLE "ROOM" ALTER COLUMN "adminId" SET NOT NULL;

-- AlterTable
ALTER TABLE "USER" ALTER COLUMN "hospitalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ROOM" ADD CONSTRAINT "ROOM_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "USER"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "USER" ADD CONSTRAINT "USER_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "HOSPITAL"("id") ON DELETE SET NULL ON UPDATE CASCADE;
