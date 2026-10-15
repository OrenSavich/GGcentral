import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
import { HEALTH_ROUTE, READINESS_ROUTE } from './health.constants.js';
import { HealthStatusDto } from './health.dto.js';

@ApiTags('health')
@Controller(HEALTH_ROUTE)
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ type: HealthStatusDto })
  live(): HealthStatusDto {
    return { status: 'ok' };
  }

  @Get(READINESS_ROUTE)
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiOkResponse({ type: HealthStatusDto })
  @ApiServiceUnavailableResponse({ description: 'Database is unavailable' })
  async ready(): Promise<HealthStatusDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database is unavailable');
    }

    return { status: 'ok' };
  }
}
