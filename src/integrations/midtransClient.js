import midtrans from 'midtrans-client';

const mode = process.env.MIDTRANS_MODE;

const serverKey = mode === 'PRODUCTION' ? process.env.MIDTRANS_SERVER_KEY : process.env.MIDTRANS_SANDBOX_SERVER_KEY;
const clientKey = mode === 'PRODUCTION' ? process.env.MIDTRANS_CLIENT_KEY : process.env.MIDTRANS_SANDBOX_CLIENT_KEY;

if (!serverKey) {
  throw new Error(`Missing ${mode === 'PRODUCTION' ? 'MIDTRANS_SERVER_KEY' : 'MIDTRANS_SANDBOX_SERVER_KEY'} environment variable`);
}

export const snap = new midtrans.Snap({
  isProduction: mode === 'PRODUCTION',
  serverKey: serverKey,
  clientKey: clientKey,
});

export const getServerKey = () => {
  return serverKey;
};

export const isProductionMode = () => mode === 'PRODUCTION';

export const getBaseUrl = () => {
  return mode === 'PRODUCTION' ? process.env.MIDTRANS_PRODUCTION_URL : process.env.MIDTRANS_SANDBOX_URL;
};
