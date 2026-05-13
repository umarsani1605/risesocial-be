import { BrevoClient } from '@getbrevo/brevo';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export async function sendEmail({ to, toName, subject, htmlContent }) {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.EMAIL_FROM_NAME,
      email: process.env.EMAIL_FROM_ADDRESS,
    },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent,
  });

  return result;
}
