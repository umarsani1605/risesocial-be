import { describe, it, expect, vi } from 'vitest';
import RylsPaymentService from '../src/services/rylsPaymentService.js';

// Mock repositories (avoid real DB)
vi.mock('../src/repositories/rylsRegistrationRepository.js', () => {
  class RylsRegistrationRepository {
    async findById(id) {
      return {
        id,
        full_name: 'John Doe',
        email: 'john@example.com',
        whatsapp: '+6212345',
        scholarship_type: 'FULLY_FUNDED',
        payment_status: 'PENDING',
      };
    }
    async updateStatus(id, status) {
      return { id, payment_status: status };
    }
  }
  return { RylsRegistrationRepository };
});

vi.mock('../src/repositories/rylsPaymentRepository.js', () => {
  class RylsPaymentRepository {
    async findActivePendingPayment() {
      return null;
    }
    async getNextSequenceNumber() {
      return 1;
    }
    async create(data) {
      return { id: 99, ...data };
    }
    async findByOrderId() {
      return null;
    }
    async updateByOrderId(orderId, update) {
      return { id: 99, order_id: orderId, ...update };
    }
    async findByRegistrationId() {
      return [];
    }
  }
  return { RylsPaymentRepository };
});

// Run only if sandbox credentials and API plugin exist
const canRun =
  process.env.MIDTRANS_MODE && (process.env.MIDTRANS_SANDBOX_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY) && process.env.API_PLUGIN_URL;

describe.runIf(canRun)('Payment createTransaction (external Midtrans + Currency)', () => {
  it(
    'creates transaction and returns token + redirect_url',
    async () => {
      const service = new RylsPaymentService();
      const result = await service.createTransaction(1);
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(10);
      expect(result.redirect_url).toMatch(/^https?:\/\//);
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('IDR');
    },
    { timeout: 30000 }
  );
});
