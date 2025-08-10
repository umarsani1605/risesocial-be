-- CreateEnum
CREATE TYPE "MidtransTransactionStatus" AS ENUM ('pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'chargeback');

-- CreateEnum
CREATE TYPE "MidtransFraudStatus" AS ENUM ('accept', 'challenge', 'deny');

-- CreateTable
CREATE TABLE "ryls_payments" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "order_id" TEXT NOT NULL,
    "snap_token" TEXT NOT NULL,
    "redirect_url" TEXT,
    "transaction_id" TEXT,
    "payment_type" TEXT,
    "gross_amount_idr" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "transaction_status" "MidtransTransactionStatus" NOT NULL DEFAULT 'pending',
    "fraud_status" "MidtransFraudStatus",
    "payment_details" JSONB,
    "last_notification" JSONB,
    "notified_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryls_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_payments_order_id_key" ON "ryls_payments"("order_id");

-- CreateIndex
CREATE INDEX "ryls_payments_registration_id_idx" ON "ryls_payments"("registration_id");

-- CreateIndex
CREATE INDEX "ryls_payments_transaction_status_idx" ON "ryls_payments"("transaction_status");

-- CreateIndex
CREATE INDEX "ryls_payments_payment_type_idx" ON "ryls_payments"("payment_type");

-- CreateIndex
CREATE INDEX "ryls_payments_order_id_idx" ON "ryls_payments"("order_id");

-- AddForeignKey
ALTER TABLE "ryls_payments" ADD CONSTRAINT "ryls_payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
