/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeSessionId_key" ON "payment"("stripeSessionId");
