export function paymentConfirmationEmail({ name, transactionCode, amount, currency = 'IDR' }) {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:#1a56db;padding:32px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Rise Social</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Pembayaran Berhasil ✅</h2>
          <p style="margin:0 0 24px;color:#374151;line-height:1.6;">Hei ${name}, pembayaranmu telah berhasil dikonfirmasi.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px;">
            <tr>
              <td style="color:#6b7280;font-size:14px;padding:6px 0;">Kode Transaksi</td>
              <td style="color:#111827;font-size:14px;font-weight:600;text-align:right;padding:6px 0;">${transactionCode}</td>
            </tr>
            <tr>
              <td style="color:#6b7280;font-size:14px;padding:6px 0;border-top:1px solid #e5e7eb;">Total Pembayaran</td>
              <td style="color:#1a56db;font-size:16px;font-weight:700;text-align:right;padding:6px 0;border-top:1px solid #e5e7eb;">${formattedAmount}</td>
            </tr>
          </table>
          <p style="margin:0;color:#374151;line-height:1.6;">Akses program kamu sekarang tersedia. Selamat belajar!</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© Rise Social. Semua hak dilindungi.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
