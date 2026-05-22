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
    it('produces <PREFIX 4><MOD 2><HEX 3><COUNTER 5> = 14 chars', () => {
      const code = generateTransactionCode('RYLS', 1);
      expect(code).toHaveLength(14);
      expect(code.substring(0, 4)).toBe('RYLS');
      expect(code.substring(4, 6)).toBe('01'); // 1 % 100 = 01
      expect(code.substring(9, 14)).toBe('00001');
    });

    it('uses sequence % 100 for the MOD segment', () => {
      expect(generateTransactionCode('RYLS', 105).substring(4, 6)).toBe('05');
      expect(generateTransactionCode('RYLS', 99).substring(4, 6)).toBe('99');
      expect(generateTransactionCode('RYLS', 100).substring(4, 6)).toBe('00');
    });

    it('zero-pads the COUNTER segment to 5 digits', () => {
      expect(generateTransactionCode('ACAD', 42).substring(9, 14)).toBe('00042');
      expect(generateTransactionCode('ACAD', 12345).substring(9, 14)).toBe('12345');
    });

    it('uppercases the prefix', () => {
      expect(generateTransactionCode('ryls', 7).substring(0, 4)).toBe('RYLS');
    });

    it('uses random HEX in the middle segment (positions 6-9)', () => {
      const code = generateTransactionCode('RYLS', 1);
      expect(code.substring(6, 9)).toMatch(/^[0-9A-F]{3}$/);
    });
  });
});
