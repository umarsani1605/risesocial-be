const env = process.env.NODE_ENV || 'development';

export const loggerConfig = {
  development: {
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
        {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            destination: './logs/app.log',
            mkdir: true,
          },
        },
      ],
    },
  },
  production: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: false,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        destination: './logs/app.log',
        mkdir: true,
        messageFormat: '{time} [{level}] {msg}',
      },
    },
  },
  test: false,
};

export const getLoggerConfig = () => loggerConfig[env] ?? true;
