import { z } from 'zod';

const postgresProtocol = /^postgres(?:ql)?:$/;

function isPostgresUrl(value: string): boolean {
  try {
    return postgresProtocol.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().refine(isPostgresUrl, {
    message: 'DATABASE_URL must be a PostgreSQL connection string',
  }),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Environment = z.infer<typeof environmentSchema>;
