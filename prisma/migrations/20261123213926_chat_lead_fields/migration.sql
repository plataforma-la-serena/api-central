-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "customer_name" TEXT,
ADD COLUMN     "wants_reservation" BOOLEAN NOT NULL DEFAULT false;
