export const REDACTED_LOG_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["x-api-key"]',
  '*.authorization',
  '*.accessToken',
  '*.refreshToken',
  '*.idToken',
  '*.token',
  '*.password',
  '*.secret',
  '*.DATABASE_URL',
] as const;

export const REDACTION_CENSOR = '[Redacted]';

const SENSITIVE_LOG_TEXT = /postgres(?:ql)?:\/\/|password|token|secret|authorization/i;

export function safeErrorDetail(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined;
  }

  if (SENSITIVE_LOG_TEXT.test(error.message)) {
    return error.name;
  }

  return error.message;
}
