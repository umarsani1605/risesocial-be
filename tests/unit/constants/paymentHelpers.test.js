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

    it('should default to pending for empty string', () => {
      expect(mapMidtransStatus('')).toBe('pending');
    });
  });

  describe('mapPaymentMethod', () => {
    // --- Bank Transfer via legacy top-level bank field ---
    it('maps bank_transfer + bca (top-level bank) to BCA Virtual Account', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'bca' };
      expect(mapPaymentMethod(notification)).toBe('BCA Virtual Account');
    });

    it('maps bank_transfer + bni (top-level bank) to BNI Virtual Account', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'bni' };
      expect(mapPaymentMethod(notification)).toBe('BNI Virtual Account');
    });

    it('maps bank_transfer + bri (top-level bank) to BRI Virtual Account', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'bri' };
      expect(mapPaymentMethod(notification)).toBe('BRI Virtual Account');
    });

    it('maps bank_transfer + cimb (top-level bank) to CIMB Virtual Account', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'cimb' };
      expect(mapPaymentMethod(notification)).toBe('CIMB Virtual Account');
    });

    it('maps bank_transfer + unknown bank to Bank Transfer fallback', () => {
      const notification = { payment_type: 'bank_transfer', bank: 'other_bank' };
      expect(mapPaymentMethod(notification)).toBe('Bank Transfer');
    });

    it('maps bank_transfer with no bank to Bank Transfer fallback', () => {
      const notification = { payment_type: 'bank_transfer' };
      expect(mapPaymentMethod(notification)).toBe('Bank Transfer');
    });

    // --- Bank Transfer via va_numbers array (priority over top-level bank) ---
    it('resolves bank from va_numbers[0].bank instead of top-level bank', () => {
      const notification = {
        payment_type: 'bank_transfer',
        va_numbers: [{ bank: 'bca', va_number: '12345' }],
        bank: 'bni', // should be ignored because va_numbers takes priority
      };
      expect(mapPaymentMethod(notification)).toBe('BCA Virtual Account');
    });

    it('maps BNI via va_numbers array', () => {
      const notification = {
        payment_type: 'bank_transfer',
        va_numbers: [{ bank: 'bni', va_number: '98765' }],
      };
      expect(mapPaymentMethod(notification)).toBe('BNI Virtual Account');
    });

    it('maps BRI via va_numbers array', () => {
      const notification = {
        payment_type: 'bank_transfer',
        va_numbers: [{ bank: 'bri', va_number: '11111' }],
      };
      expect(mapPaymentMethod(notification)).toBe('BRI Virtual Account');
    });

    it('maps CIMB via va_numbers array', () => {
      const notification = {
        payment_type: 'bank_transfer',
        va_numbers: [{ bank: 'cimb', va_number: '22222' }],
      };
      expect(mapPaymentMethod(notification)).toBe('CIMB Virtual Account');
    });

    // --- Permata via permata_va_number field (priority over top-level bank) ---
    it('maps bank_transfer with permata_va_number to Permata Virtual Account', () => {
      const notification = {
        payment_type: 'bank_transfer',
        permata_va_number: '888000123456',
      };
      expect(mapPaymentMethod(notification)).toBe('Permata Virtual Account');
    });

    it('va_numbers takes priority over permata_va_number', () => {
      const notification = {
        payment_type: 'bank_transfer',
        va_numbers: [{ bank: 'bca', va_number: '11122' }],
        permata_va_number: '888000123456',
      };
      expect(mapPaymentMethod(notification)).toBe('BCA Virtual Account');
    });

    // --- Mandiri Bill ---
    it('maps echannel to Mandiri Bill', () => {
      const notification = { payment_type: 'echannel' };
      expect(mapPaymentMethod(notification)).toBe('Mandiri Bill');
    });

    // --- E-wallets ---
    it('maps gopay to GoPay', () => {
      const notification = { payment_type: 'gopay' };
      expect(mapPaymentMethod(notification)).toBe('GoPay');
    });

    it('maps shopeepay to ShopeePay', () => {
      const notification = { payment_type: 'shopeepay' };
      expect(mapPaymentMethod(notification)).toBe('ShopeePay');
    });

    it('maps qris to QRIS', () => {
      const notification = { payment_type: 'qris' };
      expect(mapPaymentMethod(notification)).toBe('QRIS');
    });

    // --- Convenience stores ---
    it('maps cstore + indomaret to Indomaret', () => {
      const notification = { payment_type: 'cstore', store: 'indomaret' };
      expect(mapPaymentMethod(notification)).toBe('Indomaret');
    });

    it('maps cstore + alfamart to Alfamart', () => {
      const notification = { payment_type: 'cstore', store: 'alfamart' };
      expect(mapPaymentMethod(notification)).toBe('Alfamart');
    });

    it('maps cstore with unknown store to Convenient Store', () => {
      const notification = { payment_type: 'cstore', store: 'unknown_store' };
      expect(mapPaymentMethod(notification)).toBe('Convenient Store');
    });

    it('maps cstore with no store to Convenient Store', () => {
      const notification = { payment_type: 'cstore' };
      expect(mapPaymentMethod(notification)).toBe('Convenient Store');
    });

    // --- Credit Card and Buy Now Pay Later ---
    it('maps credit_card to Credit Card', () => {
      const notification = { payment_type: 'credit_card' };
      expect(mapPaymentMethod(notification)).toBe('Credit Card');
    });

    it('maps akulaku to Akulaku', () => {
      const notification = { payment_type: 'akulaku' };
      expect(mapPaymentMethod(notification)).toBe('Akulaku');
    });

    it('maps kredivo to Kredivo', () => {
      const notification = { payment_type: 'kredivo' };
      expect(mapPaymentMethod(notification)).toBe('Kredivo');
    });

    // --- Fallback ---
    it('returns payment_type as-is for unknown payment types', () => {
      const notification = { payment_type: 'unknown_future_method' };
      expect(mapPaymentMethod(notification)).toBe('unknown_future_method');
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

    it('should format single-digit sequence with leading zero', () => {
      const code = generateTransactionCode('ACAD', 1);
      expect(code.substring(4, 6)).toBe('01');
    });

    it('should format sequence 99 as 99', () => {
      const code = generateTransactionCode('RYLS', 99);
      expect(code.substring(4, 6)).toBe('99');
    });

    it('should wrap sequence at 100', () => {
      const code = generateTransactionCode('RYLS', 105);
      expect(code.substring(4, 6)).toBe('05');
    });

    it('should wrap sequence 100 to 00', () => {
      const code = generateTransactionCode('RYLS', 100);
      expect(code.substring(4, 6)).toBe('00');
    });

    it('should have 8 uppercase hex characters at end', () => {
      const code = generateTransactionCode('RYLS', 1);
      const hexPart = code.substring(6, 14);
      expect(hexPart).toMatch(/^[0-9A-F]{8}$/);
    });

    it('should generate unique codes across 100 iterations', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateTransactionCode('RYLS', i));
      }
      expect(codes.size).toBe(100);
    });

    it('should normalize short prefix by padding with X', () => {
      const code = generateTransactionCode('AC', 1);
      expect(code.substring(0, 4)).toBe('ACXX');
    });

    it('should truncate long prefix to 4 characters', () => {
      const code = generateTransactionCode('ACADEMY', 1);
      expect(code.substring(0, 4)).toBe('ACAD');
    });

    it('should uppercase the prefix', () => {
      const code = generateTransactionCode('ryls', 1);
      expect(code.substring(0, 4)).toBe('RYLS');
    });

    it('TRANSACTION_CODE_CONFIG.ACADEMY_PREFIX is ACAD', () => {
      expect(TRANSACTION_CODE_CONFIG.ACADEMY_PREFIX).toBe('ACAD');
    });

    it('TRANSACTION_CODE_CONFIG.LENGTH is 14', () => {
      expect(TRANSACTION_CODE_CONFIG.LENGTH).toBe(14);
    });
  });
});
