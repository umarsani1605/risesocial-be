export function getEmailLogoUrl() {
  return "https://risesocial.org/images/logo_white.png";
}

const RISE_PRIMARY = "#FF8E4F";

export function renderEmailButton({ label, href }) {
  if (!label || !href) return "";

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
      <tr>
        <td align="center" bgcolor="${RISE_PRIMARY}" style="border-radius:10px;">
          <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 22px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailInfoBox(content) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f8;border-radius:10px;margin:28px 0;">
      <tr>
        <td style="padding:28px 32px;">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailLayout({
  title,
  intro,
  content,
  outro = "",
  disclaimer = "",
}) {
  const logoUrl = getEmailLogoUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F6F6F6;font-family:Arial,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;overflow:hidden;">
          <tr>
            <td style="background:${RISE_PRIMARY};padding:20px 40px;">
              <img src="${logoUrl}" alt="Rise Social" style="display:block;max-width:72px;width:100%;height:auto;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 24px;">
              ${title ? `<h1 style="margin:0 0 24px;color:#111827;font-size:28px;line-height:1.2;font-weight:800;">${title}</h1>` : ""}
              <div style="color:#374151;font-size:16px;line-height:1.8;">
                ${intro}
                ${content}
                ${outro}
              </div>
            </td>
          </tr>
        </table>
        <table width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;">
          <tr>
            <td style="padding:28px 40px;text-align:center;color:#9ca3af;font-size:12px;line-height:1.8;">
              ${disclaimer ? `<div style="margin-bottom:8px;">${disclaimer}</div>` : ""}
              <div style="margin-bottom:6px;">Bandung, West Java 40286, Indonesia</div>
              <div>© ${year} Rise Social</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
