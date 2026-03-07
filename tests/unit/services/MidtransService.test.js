import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidtransService } from '../../../src/services/shared/MidtransService.js';
import * as midtransClient from '../../../src/integrations/midtransClient.js';

vi.mock('../../../src/integrations/midtransClient.js');
vi.mock('../../../src/utils/loggerContext.js', () => ({
  getLogger: () => ({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('MidtransService', () => {
  let service;

  beforeEach(() => {
    service = new MidtransService();
    vi.clearAllMocks();
  });

  describe('createSnapTransaction', () => {
    it('should create snap transaction successfully', async () => {
      // Arrange
      const mockResponse = {
        token: 'test-snap-token-123',
        redirect_url: 'https://app.midtrans.com/snap/v2/vtweb/test-token',
      };

      vi.mocked(midtransClient.snap.createTransaction).mockResolvedValue(mockResponse);

      const params = {
        orderId: 'RYLS01ABCD1234',
        grossAmount: 100000,
        customerDetails: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '08123456789',
        },
        itemDetails: [
          {
            id: 'ryls-self-funded',
            name: 'RYLS Self Funded',
            price: 100000,
            quantity: 1,
          },
        ],
      };

      // Act
      const result = await service.createSnapTransaction(params);

      // Assert
      expect(result).toEqual({
        token: 'test-snap-token-123',
        redirectUrl: 'https://app.midtrans.com/snap/v2/vtweb/test-token',
      });
      expect(midtransClient.snap.createTransaction).toHaveBeenCalledWith({
        transaction_details: {
          order_id: 'RYLS01ABCD1234',
          gross_amount: 100000,
        },
        customer_details: params.customerDetails,
        item_details: params.itemDetails,
        credit_card: { secure: true },
      });
    });

    it('should throw error for invalid amount', async () => {
      // Arrange
      const params = {
        orderId: 'RYLS01ABCD1234',
        grossAmount: 500, // Too low
        customerDetails: { email: 'test@example.com' },
        itemDetails: [{ id: 'test', name: 'Test', price: 500, quantity: 1 }],
      };

      // Act & Assert
      await expect(service.createSnapTransaction(params)).rejects.toThrow('Invalid gross_amount: must be between 1,000 and 999,999,999 IDR');
    });

    it('should throw error for missing customer email', async () => {
      // Arrange
      const params = {
        orderId: 'RYLS01ABCD1234',
        grossAmount: 100000,
        customerDetails: {}, // Missing email
        itemDetails: [{ id: 'test', name: 'Test', price: 100000, quantity: 1 }],
      };

      // Act & Assert
      await expect(service.createSnapTransaction(params)).rejects.toThrow('Invalid customer_details: email is required');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      // Arrange
      vi.mocked(midtransClient.getServerKey).mockReturnValue('test-server-key');

      const notificationData = {
        order_id: 'RYLS01ABCD1234',
        status_code: '200',
        gross_amount: '100000',
        signature_key: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA512 hash
      };

      // Mock crypto to return expected hash
      const crypto = require('crypto');
      const expectedHash = crypto.createHash('sha512').update('RYLS01ABCD1234200100000test-server-key').digest('hex');

      notificationData.signature_key = expectedHash;

      // Act
      const result = service.verifyWebhookSignature(notificationData);

      // Assert
      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      // Arrange
      vi.mocked(midtransClient.getServerKey).mockReturnValue('test-server-key');

      const notificationData = {
        order_id: 'RYLS01ABCD1234',
        status_code: '200',
        gross_amount: '100000',
        signature_key: 'invalid-signature',
      };

      // Act
      const result = service.verifyWebhookSignature(notificationData);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for missing fields', () => {
      // Arrange
      const notificationData = {
        order_id: 'RYLS01ABCD1234',
        // Missing status_code, gross_amount, signature_key
      };

      // Act
      const result = service.verifyWebhookSignature(notificationData);

      // Assert
      expect(result).toBe(false);
    });
  });
});
