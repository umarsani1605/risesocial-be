/**
 * Payment transaction seed data generator
 * Generates 10 transactions with items and Midtrans data
 */

// Payment method values as stored by mapPaymentMethod() in production
const PAID_PAYMENT_METHODS = [
  'BCA Virtual Account',
  'BNI Virtual Account',
  'BRI Virtual Account',
  'QRIS',
  'GoPay',
  'Credit Card',
];
const PENDING_PAYMENT_METHODS = ['Credit Card', 'GoPay', 'QRIS'];

function getScholarshipLabel(scholarshipType) {
  if (scholarshipType === 'FULLY_FUNDED') return 'Fully Funded';
  if (scholarshipType === 'SELF_FUNDED') return 'Self Funded';
  return scholarshipType;
}

/**
 * Generate payment transaction data
 * @param {Array} userIds - Array of user IDs
 * @param {Array} enrollments - Array of { id, cohort: { name, academy: { title } } }
 * @param {Array} rylsRegistrations - Array of { id, scholarship_type }
 * @returns {Array} Array of transaction objects
 */
export function generateTransactions(userIds, enrollments, rylsRegistrations) {
  const transactions = [];
  const statuses = ['pending', 'paid', 'paid', 'paid', 'failed', 'expired', 'paid', 'paid', 'pending', 'paid'];

  for (let i = 0; i < 10; i++) {
    const userId = userIds[i % userIds.length];
    const status = statuses[i];
    const isAcademyPayment = i < 6;
    const productType = isAcademyPayment ? 'academy_enrollment' : 'ryls_registration';

    const enrollment = enrollments[i % enrollments.length];
    const rylsReg = rylsRegistrations[i % rylsRegistrations.length];
    const productTypeId = isAcademyPayment ? enrollment.id : rylsReg.id;

    const amount = isAcademyPayment ? 3500000 + i * 500000 : 2500000;
    const transactionCode = `TRX${Date.now()}${i.toString().padStart(3, '0')}`;

    const isPaid = status === 'paid';
    const paymentMethod = isPaid
      ? PAID_PAYMENT_METHODS[i % PAID_PAYMENT_METHODS.length]
      : PENDING_PAYMENT_METHODS[i % PENDING_PAYMENT_METHODS.length];

    const productName = isAcademyPayment
      ? (enrollment.cohort?.academy?.title ?? enrollment.cohort?.name ?? 'Academy Enrollment')
      : getScholarshipLabel(rylsReg.scholarship_type);

    transactions.push({
      transaction_code: transactionCode,
      amount,
      currency: 'IDR',
      status,
      provider: 'midtrans',
      payment_method: paymentMethod,
      customer_name: `Customer ${i + 1}`,
      customer_email: `customer${i + 1}@example.com`,
      user_id: userId,
      product_type: productType,
      product_type_id: productTypeId,
      paid_at: isPaid ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      items: [
        {
          product_code: isAcademyPayment ? `ACADEMY-${i + 1}` : `RYLS-${i + 1}`,
          product_name: productName,
          quantity: 1,
          unit_price: amount,
          total_price: amount,
        },
      ],
      midtrans_data: {
        snap_token: `snap_${transactionCode}_${Math.random().toString(36).substring(7)}`,
        midtrans_order_id: `order_${transactionCode}`,
        transaction_status: isPaid ? 'settlement' : status,
      },
    });
  }

  return transactions;
}
