import { env } from '@/env.js';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import pino, { type LoggerOptions } from 'pino';

const loggerConfig: Record<'development' | 'production' | 'test', LoggerOptions> = {
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  },

  production: {
    level: 'info'
  },

  test: {
    level: 'info'
  }
};

export const LogScope = {
  APP: '[APP]',
  REQUEST: '[REQUEST]',
  ERROR: '[ERROR]',
  WARN: '[WARN]',
  AUTH: '[AUTH]',
  DATABASE: '[DATABASE]'
} as const;

const config = loggerConfig[env.NODE_ENV] ?? loggerConfig.development;

function createLogger() {
  if (env.NODE_ENV === 'development') {
    return pino(config);
  }

  const logsDir = resolve(process.cwd(), 'logs');
  mkdirSync(logsDir, { recursive: true });

  return pino(
    config,
    pino.destination({
      dest: resolve(logsDir, `${env.NODE_ENV}.log`),
      sync: false
    })
  );
}

export const logger = createLogger();
