import { renderEmailButton, renderEmailInfoBox, renderEmailLayout } from './layout.js';

export function certificateReadyEmail({ name, cohortName, academyTitle, certCode, certificateUrl, verifyUrl }) {
  const downloadUrl = certificateUrl || verifyUrl;

  return renderEmailLayout({
    title: 'Certificate of Completion',
    intro: `
      <p style="margin:0 0 18px;">Hi ${name}!</p>
      <p style="margin:0 0 18px;">Your hard work has finally paid off. Congratulations on successfully completing this program!</p>
      <p style="margin:0;">Here are the details of your certificate, ready to download:</p>
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
        ${renderEmailButton({ label: 'Download Certificate', href: downloadUrl })}
      ` : ''}
    `,
    outro: `
      <p style="margin:32px 0 0;">You can download your certificate using the button above or from the Academy page in your Rise Social dashboard.</p>
      <p style="margin:32px 0 0;">Warm regards,</p>
      <p style="margin:6px 0 0;font-weight:700;">Rise Social</p>
    `,
  });
}
