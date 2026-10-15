import { Body, Controller, Module, Post, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { z } from 'zod';

const probeSchema = z.object({
  name: z.string().min(1),
});

@Controller('probe')
class ProbeController {
  @Post()
  create(@Body({ schema: probeSchema }) body: z.infer<typeof probeSchema>): { name: string } {
    return body;
  }
}

@Module({
  controllers: [ProbeController],
})
class ProbeModule {}

describe('StandardSchemaValidationPipe', () => {
  it('rejects an invalid body and accepts a valid one', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProbeModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.listen(0, '127.0.0.1');

    try {
      const baseUrl = await listenUrl(app.getHttpServer());
      const rejected = await fetch(`${baseUrl}/probe`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });
      const accepted = await fetch(`${baseUrl}/probe`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'GGCentral' }),
      });

      expect(rejected.status).toBe(400);
      expect(accepted.status).toBe(201);
      await expect(accepted.json()).resolves.toEqual({ name: 'GGCentral' });
    } finally {
      await app.close();
    }
  });
});

async function listenUrl(server: { address(): { port: number } | string | null }): Promise<string> {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Expected the probe server to listen on a TCP port');
  }

  return `http://127.0.0.1:${address.port}`;
}
