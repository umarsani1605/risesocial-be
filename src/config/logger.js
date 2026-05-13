const env = process.env.NODE_ENV || 'development';

export function getLoggerConfig() {
  if (env === 'test') return false;
  if (env === 'production') return false;
  return {
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  };
}
