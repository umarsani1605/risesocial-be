/**
 * Payment transaction seed data generator.
 * Generates one transaction per enrollment, with realistic status, amount, and customer data.
 * RYLS transactions are handled separately in 05-ryls.js and are NOT touched here.
 */

const PAYMENT_METHODS = [
  'BCA Virtual Account',
  'BNI Virtual Account',
  'BRI Virtual Account',
  'Mandiri Virtual Account',
  'QRIS',
  'GoPay',
  'OVO',
  'Credit Card',
];

const PENDING_PAYMENT_METHODS = ['QRIS', 'GoPay', 'OVO', 'Credit Card'];

/** Non-sequential 5-digit transaction codes */
function randomTransactionCode() {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `RSC${suffix}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick transaction status based on enrollment status.
 * completed/active → always paid
 * pending → 50% paid, 30% pending, 20% failed
 */
function pickStatus(enrollmentStatus) {
  if (enrollmentStatus === 'completed' || enrollmentStatus === 'active') return 'paid';
  const roll = Math.random();
  if (roll < 0.5) return 'paid';
  if (roll < 0.8) return 'pending';
  return 'failed';
}

/**
 * Generate payment transactions from cohort enrollments.
 *
 * @param {Array} enrollments - Array of:
 *   {
 *     id, status,
 *     user: { id, first_name, last_name, email },
 *     cohort: { name, academy: { title, pricing: [{ name, discount_price, order }] } }
 *   }
 * @returns {Array} Array of transaction objects
 */
export function generateTransactions(enrollments) {
  return enrollments.map((enrollment) => {
    const txStatus = pickStatus(enrollment.status);
    const isPaid = txStatus === 'paid';
    const paymentMethod = isPaid
      ? randomFrom(PAYMENT_METHODS)
      : randomFrom(PENDING_PAYMENT_METHODS);
    const transactionCode = randomTransactionCode();

    // Use the Standard pricing tier (order 2); fall back to first available
    const pricing = enrollment.cohort.academy.pricing ?? [];
    const standardPricing = pricing.find((p) => p.order === 2) ?? pricing[0];
    const amount = standardPricing?.discount_price ?? 2500000;

    const customerName = `${enrollment.user.first_name} ${enrollment.user.last_name}`;
    const productName = enrollment.cohort.academy.title;
    const midtransOrderId = `RSC-ORDER-${transactionCode}`;

    // Short product code from academy title
    const productCode = `ACADEMY-${enrollment.cohort.academy.title
      .substring(0, 8)
      .replace(/\s/g, '')
      .toUpperCase()}`;

    return {
      transaction_code: transactionCode,
      amount,
      currency: 'IDR',
      status: txStatus,
      provider: 'midtrans',
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_email: enrollment.user.email,
      user_id: enrollment.user.id,
      product_type: 'academy_enrollment',
      product_type_id: enrollment.id,
      paid_at: isPaid
        ? new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000))
        : null,
      items: [
        {
          product_code: productCode,
          product_name: productName,
          product_category: 'academy_enrollment',
          quantity: 1,
          unit_price: amount,
          total_price: amount,
        },
      ],
      midtrans_data: {
        snap_token: `snap-${transactionCode}-${Math.random().toString(36).substring(2, 9)}`,
        midtrans_order_id: midtransOrderId,
        transaction_status: isPaid ? 'settlement' : txStatus === 'pending' ? 'pending' : 'deny',
      },
    };
  });
}
