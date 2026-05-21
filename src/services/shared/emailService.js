import { sendEmail } from '../../integrations/brevoClient.js';
import { certificateReadyEmail } from '../../templates/email/certificateReadyEmail.js';

export class EmailService {

  async sendCertificateReady({ to, name, cohortName, academyTitle, certCode, certificateUrl, verifyUrl }) {
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: `Sertifikat Kelulusan ${academyTitle}`,
        htmlContent: certificateReadyEmail({ name, cohortName, academyTitle, certCode, certificateUrl, verifyUrl }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export const emailService = new EmailService();
