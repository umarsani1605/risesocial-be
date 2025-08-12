import { describe, it, expect } from 'vitest';
import { convertUsdToIdr } from '../src/integrations/currencyConverter.js';

const canRun = Boolean(process.env.API_PLUGIN_URL);

describe.runIf(canRun)('Currency conversion (external API)', () => {
  it('converts 15 USD to IDR successfully', async () => {
    const res = await convertUsdToIdr(15);
    console.log('💰 [CurrencyTest] Result:', res);
    expect(res.success).toBe(true);
    expect(typeof res.result).toBe('number');
    expect(res.result).toBeGreaterThan(0);
    expect(typeof res.rate).toBe('number');
  });

  it('fails with invalid amount', async () => {
    const res = await convertUsdToIdr(-1);
    expect(res.success).toBe(false);
  });
});
