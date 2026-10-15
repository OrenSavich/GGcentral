import { environmentSchema } from './environment.js';

const localDatabaseUrl = 'postgresql://ggcentral:ggcentral_local_only@localhost:5432/ggcentral';

describe('environmentSchema', () => {
  it('rejects a missing database url', () => {
    expect(() => environmentSchema.parse({})).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-postgres database url', () => {
    expect(() =>
      environmentSchema.parse({ DATABASE_URL: 'http://localhost:5432/ggcentral' }),
    ).toThrow(/PostgreSQL/);
  });

  it('applies local defaults when only the database url is set', () => {
    const environment = environmentSchema.parse({ DATABASE_URL: localDatabaseUrl });

    expect(environment).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: localDatabaseUrl,
      WEB_ORIGIN: 'http://localhost:3000',
      LOG_LEVEL: 'info',
    });
  });
});
