import { sendEmail } from '../integrations/brevoClient.js';
import { welcomeEmail } from '../templates/email/welcomeEmail.js';
import { paymentConfirmationEmail } from '../templates/email/paymentConfirmationEmail.js';
import { cohortEnrollmentEmail } from '../templates/email/cohortEnrollmentEmail.js';
import { certificateReadyEmail } from '../templates/email/certificateReadyEmail.js';
import { getLogger } from '../lib/loggerContext.js';

export class EmailService {
  get logger() {
    return getLogger();
  }

  async sendWelcome({ to, name }) {
    this.logger.info({ to }, '[emailService] sendWelcome start');
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Selamat datang di Rise Social!',
        htmlContent: welcomeEmail({ name }),
      });
      this.logger.info({ to }, '[emailService] sendWelcome success');
      return result;
    } catch (error) {
      this.logger.error({ err: error, to }, '[emailService] sendWelcome error');
      throw error;
    }
  }

  async sendPaymentConfirmation({ to, name, transactionCode, amount, currency = 'IDR' }) {
    this.logger.info({ to, transactionCode }, '[emailService] sendPaymentConfirmation start');
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Konfirmasi Pembayaran — Rise Social',
        htmlContent: paymentConfirmationEmail({ name, transactionCode, amount, currency }),
      });
      this.logger.info({ to }, '[emailService] sendPaymentConfirmation success');
      return result;
    } catch (error) {
      this.logger.error({ err: error, to }, '[emailService] sendPaymentConfirmation error');
      throw error;
    }
  }

  async sendCohortEnrollment({ to, name, cohortName, academyTitle }) {
    this.logger.info({ to, cohortName }, '[emailService] sendCohortEnrollment start');
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: `Kamu terdaftar di ${cohortName} — Rise Social`,
        htmlContent: cohortEnrollmentEmail({ name, cohortName, academyTitle }),
      });
      this.logger.info({ to }, '[emailService] sendCohortEnrollment success');
      return result;
    } catch (error) {
      this.logger.error({ err: error, to }, '[emailService] sendCohortEnrollment error');
      throw error;
    }
  }

  async sendCertificateReady({ to, name, cohortName, academyTitle, certCode, verifyUrl }) {
    this.logger.info({ to, certCode }, '[emailService] sendCertificateReady start');
    try {
      const result = await sendEmail({
        to,
        toName: name,
        subject: 'Sertifikatmu sudah siap — Rise Social',
        htmlContent: certificateReadyEmail({ name, cohortName, academyTitle, certCode, verifyUrl }),
      });
      this.logger.info({ to }, '[emailService] sendCertificateReady success');
      return result;
    } catch (error) {
      this.logger.error({ err: error, to }, '[emailService] sendCertificateReady error');
      throw error;
    }
  }
}

export const emailService = new EmailService();
