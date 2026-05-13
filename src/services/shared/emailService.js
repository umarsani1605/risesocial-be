import { sendEmail } from '../../integrations/brevoClient.js';
import { welcomeEmail } from '../../templates/email/welcomeEmail.js';
import { paymentConfirmationEmail } from '../../templates/email/paymentConfirmationEmail.js';
import { cohortEnrollmentEmail } from '../../templates/email/cohortEnrollmentEmail.js';
import { certificateReadyEmail } from '../../templates/email/certificateReadyEmail.js';

export class EmailService {

  async sendWelcome({ to, name }) {
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Selamat datang di Rise Social!',
        htmlContent: welcomeEmail({ name }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async sendPaymentConfirmation({ to, name, transactionCode, amount, currency = 'IDR' }) {
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Konfirmasi Pembayaran — Rise Social',
        htmlContent: paymentConfirmationEmail({ name, transactionCode, amount, currency }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async sendCohortEnrollment({ to, name, cohortName, academyTitle }) {
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: `Kamu terdaftar di ${cohortName} — Rise Social`,
        htmlContent: cohortEnrollmentEmail({ name, cohortName, academyTitle }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async sendCertificateReady({ to, name, cohortName, academyTitle, certCode, verifyUrl }) {
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Sertifikatmu sudah siap — Rise Social',
        htmlContent: certificateReadyEmail({ name, cohortName, academyTitle, certCode, verifyUrl }),
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export const emailService = new EmailService();
