import { renderEmailButton, renderEmailInfoBox, renderEmailLayout } from './layout.js';

export function certificateReadyEmail({ name, cohortName, academyTitle, certCode, certificateUrl, verifyUrl }) {
  const downloadUrl = certificateUrl || verifyUrl;

  return renderEmailLayout({
    title: 'Sertifikat Kelulusan',
    intro: `
      <p style="margin:0 0 18px;">Hai ${name}!</p>
      <p style="margin:0 0 18px;">Perjuanganmu akhirnya membuahkan hasil. Selamat kamu telah berhasil menyelesaikan program ini dengan luar biasa!</p>
      <p style="margin:0;">Berikut adalah detail sertifikatmu yang sudah siap diunduh:</p>
    `,
    content: `
      ${renderEmailInfoBox(`
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:#6b7280;font-size:15px;padding:0 0 14px;">Program</td>
            <td style="color:#111827;font-size:15px;font-weight:700;text-align:left;padding:0 0 14px;">${academyTitle}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:15px;padding:18px 0 0;border-top:1px solid #e5e7eb;">Cohort</td>
            <td style="color:#111827;font-size:15px;font-weight:700;text-align:left;padding:18px 0 0;border-top:1px solid #e5e7eb;">${cohortName}</td>
          </tr>
        </table>
      `)}
      ${downloadUrl ? `
        ${renderEmailButton({ label: 'Unduh Sertifikat', href: downloadUrl })}
      ` : ''}
    `,
    outro: `
      <p style="margin:32px 0 0;">Kamu dapat mengunduh sertifikat melalui tombol diatas atau melalui halaman Academy di dashboard Rise Social.</p>
      <p style="margin:32px 0 0;">Salam hangat,</p>
      <p style="margin:6px 0 0;font-weight:700;">Rise Social</p>
    `,
  });
}
