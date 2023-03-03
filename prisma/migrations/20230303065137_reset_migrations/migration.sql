-- CreateTable
CREATE TABLE "Account" IF NOT EXISTS (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" IF NOT EXISTS (
    "id" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "manufacturing_ending_date" TIMESTAMP(3),
    "username" TEXT NOT NULL,
    "date_of_order" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variation" IF NOT EXISTS (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "orderId" BIGINT NOT NULL,

    CONSTRAINT "Variation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableSync" IF NOT EXISTS (
    "name" TEXT NOT NULL,
    "isSync" BOOLEAN NOT NULL,

    CONSTRAINT "TableSync_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "Variation" ADD CONSTRAINT "Variation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
