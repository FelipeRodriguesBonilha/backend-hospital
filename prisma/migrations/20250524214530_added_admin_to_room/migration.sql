-- AlterTable
ALTER TABLE "ROOM" ADD COLUMN     "adminId" TEXT;

-- AddForeignKey
ALTER TABLE "ROOM" ADD CONSTRAINT "ROOM_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "USER"("id") ON DELETE SET NULL ON UPDATE CASCADE;
