/*
  Warnings:

  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `orderId` on table `Variation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Variation" DROP CONSTRAINT "Variation_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
ALTER COLUMN "id" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Variation" ALTER COLUMN "orderId" SET NOT NULL,
ALTER COLUMN "orderId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "Variation" ADD CONSTRAINT "Variation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
