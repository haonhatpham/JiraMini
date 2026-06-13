import { StringValue } from 'ms';
import { z } from 'zod';
// Trigger initialization of dot files before parsing values

/**
 * Structural schema layout enforcing correct data types
 * and boundary configurations across all environments.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // App routing prefix validation and sanitation
  APP_PREFIX: z
    .string()
    .default('/v1/api')
    .transform((val) => {
      let prefix = val.trim();
      if (!prefix.startsWith('/')) prefix = `/${prefix}`;
      if (prefix.endsWith('/')) prefix = prefix.slice(0, -1);
      return prefix;
    }),

  // Global pagination defaults
  DEFAULT_PAGE: z.coerce.number().int().min(1).default(1),
  DEFAULT_LIMIT: z.coerce.number().int().min(1).default(10),
  MAX_SORT_FIELDS: z.coerce.number().int().min(1).default(3),
  MAX_LIMIT: z.coerce.number().int().min(1).default(100),

  // Security parameters
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  CORS_CREDENTIALS: z
    .string()
    .default('false')
    .transform((val) => val.toLowerCase() === 'true'),

  /**
   * Validates supported database connection strings for Prisma.
   *
   * Supported protocols:
   * - postgresql://
   * - postgres://
   * - mysql://
   * - sqlserver://
   * - mongodb://
   * - file:
   */
  DATABASE_URL: z.string().refine(
    (value) => {
      try {
        const url = new URL(value);

        return ['postgresql:', 'postgres:', 'mysql:', 'sqlserver:', 'mongodb:', 'file:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid database connection string'
    }
  ),

  /**
   * Maximum PostgreSQL connections in the pool.
   */
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(20),

  /**
   * Idle client timeout in milliseconds.
   */
  DATABASE_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),

  /**
   * Connection timeout in milliseconds.
   */
  DATABASE_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),

  /**
   * Enable Prisma SQL query logging.
   */
  DATABASE_LOG_QUERY: z.coerce.boolean().default(false),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET should be at least 32 characters long'),

  // Issuer must be a non-empty string (e.g., 'my-api-gateway')
  JWT_ISSUER: z.string().min(1, 'JWT_ISSUER is required'),

  // Audience can be optional or required depending on your design
  JWT_AUDIENCE: z.string().min(1, 'JWT_AUDIENCE is required').optional(),

  // Validate expiresIn format (e.g., '15m', '1h', '7d' or raw numbers as string)
  JWT_EXPIRES_IN: z
    .string()
    .min(1, 'JWT_EXPIRES_IN is required')
    .regex(
      /^(\d+(ms|s|m|h|d|w|y)|\d+)$/,
      "JWT_EXPIRES_IN must be a valid vercel/ms format (e.g., '15m', '1h', '24h', '7d')"
    )
    .transform((v) => v as StringValue),
  BCRYPT_SALT_ROUNDS: z.coerce
    .number('BCRYPT_SALT_ROUNDS must be a valid number representation')
    .int()
    .min(4, { message: 'Salt rounds below 4 are cryptographically insecure' })
    .max(31, { message: 'Salt rounds above 31 will cause heavy CPU blockages' })
    .default(10)
});

// Run synchronous configuration parsing
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('\n Invalid application configuration variables:\n');

  for (const issue of parseResult.error.issues) {
    console.error(`- ${issue.path.join('.')} : ${issue.message}`);
  }

  process.exit(1);
}

/**
 * Read-only freeze guarding runtime configurations against mutation side effects.
 * Extensively autocompletes throughout your code architecture base.
 */
export const env = Object.freeze(parseResult.data);
