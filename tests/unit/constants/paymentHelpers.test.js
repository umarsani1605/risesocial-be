import { describe, it, expect } from 'vitest';
import { mapMidtransStatus, mapPaymentMethod, generateTransactionCode, TRANSACTION_CODE_CONFIG } from '../../../src/constants/paymentHelpers.js';

describe('Payment Helpers', () => {
  describe('mapMidtransStatus', () => {
    it('should map settlement to paid', () => {
      expect(mapMidtransStatus('settlement')).toBe('paid');
    });

    it('should map capture to paid', () => {
      expect(mapMidtransStatus('capture')).toBe('paid');
    });

    it('should map pending to pending', () => {
      expect(mapMidtransStatus('pending')).toBe('pending');
    });

    it('should map challenge to pending', () => {
      expect(mapMidtransStatus('challenge')).toBe('pending');
    });

    it('should map deny to failed', () => {
      expect(mapMidtransStatus('deny')).toBe('failed');
    });

    it('should map cancel to failed', () => {
      expect(mapMidtransStatus('cancel')).toBe('failed');
    });

    it('should map expire to expired', () => {
      expect(mapMidtransStatus('expire')).toBe('expired');
    });

    it('should map refund to refunded', () => {
      expect(mapMidtransStatus('refund')).toBe('refunded');
    });

    it('should default to pending for unknown status', () => {
      expect(mapMidtransStatus('unknown_status')).toBe('pending');
    });
  });

  describe('mapPaymentMethod', () => {
    it('should map bank_transfer + bca to bca_va', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'bca' };
      expect(mapPaymentMethod(notification)).toBe('bca_va');
    });

    it('should map bank_transfer + bni to bni_va', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'bni' };
      expect(mapPaymentMethod(notification)).toBe('bni_va');
    });

    it('should map gopay to gopay', () => {
      const notification = { payment_type: 'gopay' };
      expect(mapPaymentMethod(notification)).toBe('gopay');
    });

    it('should map qris to qris', () => {
      const notification = { payment_type: 'qris' };
      expect(mapPaymentMethod(notification)).toBe('qris');
    });

    it('should map cstore + indomaret to indomaret', () => {
      const notification = { payment_type: 'cstore', store: 'indomaret' };
      expect(mapPaymentMethod(notification)).toBe('indomaret');
    });

    it('should map credit_card to credit_card', () => {
      const notification = { payment_type: 'credit_card' };
      expect(mapPaymentMethod(notification)).toBe('credit_card');
    });

    it('should default to payment_type for unknown types', () => {
      const notification = { payment_type: 'unknown_type' };
      expect(mapPaymentMethod(notification)).toBe('unknown_type');
    });
  });

  describe('generateTransactionCode', () => {
    it('should generate 14 character transaction code', () => {
      const code = generateTransactionCode('RYLS', 1);
      expect(code).toHaveLength(14);
    });

    it('should start with correct prefix', () => {
      const code = generateTransactionCode('RYLS', 1);
      expect(code.substring(0, 4)).toBe('RYLS');
    });

    it('should have 2-digit sequence', () => {
      const code = generateTransactionCode('RYLS', 5);
      expect(code.substring(4, 6)).toBe('05');
    });

    it('should wrap sequence at 100', () => {
      const code = generateTransactionCode('RYLS', 105);
      expect(code.substring(4, 6)).toBe('05');
    });

    it('should have 8 hex characters at end', () => {
      const code = generateTransactionCode('RYLS', 1);
      const hexPart = code.substring(6, 14);
      expect(hexPart).toMatch(/^[0-9A-F]{8}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateTransactionCode('RYLS', i));
      }
      expect(codes.size).toBe(100);
    });

    it('should normalize prefix to 4 characters', () => {
      const code1 = generateTransactionCode('AC', 1);
      expect(code1.substring(0, 4)).toBe('ACXX');

      const code2 = generateTransactionCode('ACADEMY', 1);
      expect(code2.substring(0, 4)).toBe('ACAD');
    });
  });
});
