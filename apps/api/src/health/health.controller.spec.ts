import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('reports liveness without touching the database', () => {
    const prisma = { $queryRaw: vi.fn() } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    expect(controller.live()).toEqual({ status: 'ok' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('reports readiness when the database answers', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ result: 1 }]),
    } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    await expect(controller.ready()).resolves.toEqual({ status: 'ok' });
  });

  it('reports unavailable when the database cannot be reached', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as PrismaService;
    const controller = new HealthController(prisma);

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
