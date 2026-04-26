import { BrevoClient } from '@getbrevo/brevo';
import { getLogger } from '../lib/loggerContext.js';

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

export async function sendEmail({ to, toName, subject, htmlContent }) {
  const logger = getLogger();
  logger.info({ to, subject }, '[brevoClient] sendEmail start');

  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.EMAIL_FROM_NAME,
      email: process.env.EMAIL_FROM_ADDRESS,
    },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent,
  });

  logger.info({ to, messageId: result.messageId }, '[brevoClient] sendEmail success');
  return result;
}
