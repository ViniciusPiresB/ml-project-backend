/*
  Warnings:

  - Added the required column `done` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "done" BOOLEAN NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
