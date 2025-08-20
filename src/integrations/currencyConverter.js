import { CacheHelper } from '../lib/CacheHelper.js';
import Freecurrencyapi from '@everapi/freecurrencyapi-js';

const API_KEY = process.env.CURRENCY_API_KEY;

if (!API_KEY) {
  console.error('[CurrencyConverter] Missing env CURRENCY_API_KEY');
  throw new Error('CURRENCY_API_KEY is not set');
}

const currencyapi = new Freecurrencyapi(API_KEY);

export const convertUsdToIdr = async (usdAmount, fastify) => {
  const cacheKey = `currency:usd_to_idr:${usdAmount}`;

  try {
    if (typeof usdAmount !== 'number' || !isFinite(usdAmount) || usdAmount <= 0) {
      throw new Error('Invalid amount');
    }

    if (fastify && fastify.cache) {
      const cached = await CacheHelper.get(fastify, cacheKey);
      if (cached) {
        console.log('[CurrencyConverter] Cache HIT for amount:', usdAmount);
        return cached;
      }
      console.log('[CurrencyConverter] Cache MISS for amount:', usdAmount);
    }

    const startedAt = Date.now();
    console.log('[CurrencyConverter] Converting USD → IDR');
    console.log('[CurrencyConverter] USD amount:', usdAmount);

    const res = await currencyapi.latest({ base_currency: 'USD', currencies: 'IDR' });
    const idrRate = res?.data?.IDR;

    if (typeof idrRate !== 'number' || !isFinite(idrRate) || idrRate <= 0) {
      throw new Error('Invalid rate from currency API');
    }

    const resultValue = usdAmount * idrRate;

    const durationMs = Date.now() - startedAt;

    console.log('[CurrencyConverter] Conversion success');
    console.log('[CurrencyConverter] Rate:', idrRate);
    console.log('[CurrencyConverter] Result (IDR):', resultValue);
    console.log('⏱️ [CurrencyConverter] Duration:', `${durationMs}ms`);

    const result = {
      success: true,
      amount: usdAmount,
      result: resultValue,
      rate: idrRate,
    };

    if (fastify && fastify.cache) {
      try {
        await CacheHelper.set(fastify, cacheKey, result, 3600000); // 1 jam TTL
        console.log('[CurrencyConverter] Cached result for amount:', usdAmount);
      } catch (cacheError) {
        console.warn('[CurrencyConverter] Cache set failed:', cacheError.message);
      }
    }

    return result;
  } catch (error) {
    console.error('[CurrencyConverter] Conversion error:', error.message);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
};
