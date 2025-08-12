const BASE_URL = process.env.API_PLUGIN_URL;
const IS_DEV = process.env.NODE_ENV !== 'production';

if (!BASE_URL) {
  // Fail fast with clear logging
  console.error('❌ [CurrencyConverter] Missing env API_PLUGIN_URL');
  throw new Error('API_PLUGIN_URL is not set');
}

if (IS_DEV) {
  console.log('🌐 [CurrencyConverter] BASE_URL configured');
}

export const convertUsdToIdr = async (usdAmount) => {
  const startedAt = Date.now();
  const url = `${BASE_URL}/convert?amount=${usdAmount}&from=USD&to=IDR`;

  try {
    console.log('🔵 [CurrencyConverter] Converting USD → IDR');
    console.log('🔹 [CurrencyConverter] USD amount:', usdAmount);
    console.log('🔗 [CurrencyConverter] Request URL:', url);

    const response = await fetch(url, { method: 'GET' });
    const status = response.status;
    console.log('📥 [CurrencyConverter] HTTP status:', status);

    const rawText = await response.text();
    // Truncate raw response to avoid noisy logs
    console.log('🧾 [CurrencyConverter] Raw response:', rawText.slice(0, 500));

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('❌ [CurrencyConverter] JSON parse error:', parseErr.message);
      throw new Error(`Invalid JSON from currency API: ${parseErr.message}`);
    }

    if (!response.ok) {
      console.error('❌ [CurrencyConverter] Non-OK response body:', parsed);
      throw new Error(`Currency API error: ${status}`);
    }

    const durationMs = Date.now() - startedAt;
    console.log('✅ [CurrencyConverter] Conversion success');
    console.log('💵 [CurrencyConverter] Rate:', parsed.rate);
    console.log('💶 [CurrencyConverter] Result (IDR):', parsed.result);
    console.log('⏱️ [CurrencyConverter] Duration:', `${durationMs}ms`);

    return {
      success: true,
      amount: usdAmount,
      result: parsed.result,
      rate: parsed.rate,
    };
  } catch (error) {
    console.error('❌ [CurrencyConverter] Conversion error:', error.message);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
};
