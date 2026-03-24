/**
 * Payment transaction seed data generator
 * Generates 10 transactions with items and Midtrans data
 */

/**
 * Generate payment transaction data
 * @param {Array} userIds - Array of user IDs
 * @param {Array} enrollmentIds - Array of cohort enrollment IDs
 * @param {Array} rylsRegistrationIds - Array of RYLS registration IDs
 * @returns {Array} Array of transaction objects
 */
export function generateTransactions(userIds, enrollmentIds, rylsRegistrationIds) {
  const transactions = [];
  const statuses = ['pending', 'paid', 'paid', 'paid', 'failed', 'expired', 'paid', 'paid', 'pending', 'paid'];

  for (let i = 0; i < 10; i++) {
    const userId = userIds[i % userIds.length];
    const status = statuses[i];
    const isAcademyPayment = i < 6;
    const productType = isAcademyPayment ? 'academy_enrollment' : 'ryls_registration';
    const productTypeId = isAcademyPayment ? enrollmentIds[i % enrollmentIds.length] : rylsRegistrationIds[i % rylsRegistrationIds.length];

    const amount = isAcademyPayment ? 3500000 + i * 500000 : 2500000;
    const transactionCode = `TRX${Date.now()}${i.toString().padStart(3, '0')}`;

    transactions.push({
      transaction_code: transactionCode,
      amount,
      currency: 'IDR',
      status,
      provider: 'midtrans',
      payment_method: status === 'paid' ? 'bank_transfer' : 'credit_card',
      customer_name: `Customer ${i + 1}`,
      customer_email: `customer${i + 1}@example.com`,
      user_id: userId,
      product_type: productType,
      product_type_id: productTypeId,
      paid_at: status === 'paid' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      items: [
        {
          product_code: isAcademyPayment ? `ACADEMY-${i + 1}` : `RYLS-${i + 1}`,
          product_name: isAcademyPayment ? 'Academy Enrollment Fee' : 'RYLS Registration Fee',
          quantity: 1,
          unit_price: amount,
          total_price: amount,
        },
      ],
      midtrans_data: {
        snap_token: `snap_${transactionCode}_${Math.random().toString(36).substring(7)}`,
        midtrans_order_id: `order_${transactionCode}`,
        transaction_status: status === 'paid' ? 'settlement' : status,
      },
    });
  }

  return transactions;
}
