/*
  Warnings:

  - Added the required column `updatedAt` to the `ARCHIVE` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HOSPITAL` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MESSAGE_VIEWED_USER` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ROLE` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ROOM_USER` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ARCHIVE" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "HOSPITAL" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MESSAGE_VIEWED_USER" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ROLE" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ROOM_USER" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
