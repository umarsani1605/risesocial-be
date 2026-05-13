import { CacheHelper } from '../utils/CacheHelper.js';
import Freecurrencyapi from '@everapi/freecurrencyapi-js';
import posthog from '../config/posthog.js';

const API_KEY = process.env.CURRENCY_API_KEY;

if (!API_KEY) {
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
      if (cached) return cached;
    }

    const res = await currencyapi.latest({ base_currency: 'USD', currencies: 'IDR' });
    const idrRate = res?.data?.IDR;

    if (typeof idrRate !== 'number' || !isFinite(idrRate) || idrRate <= 0) {
      throw new Error('Invalid rate from currency API');
    }

    const resultValue = usdAmount * idrRate;

    const result = {
      success: true,
      amount: usdAmount,
      result: resultValue,
      rate: idrRate,
    };

    if (fastify && fastify.cache) {
      await CacheHelper.set(fastify, cacheKey, result, 3600000).catch(() => {});
    }

    return result;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      posthog.captureException(error, undefined, {
        integration: 'currency_converter',
        usd_amount: usdAmount,
      });
    }
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
};
