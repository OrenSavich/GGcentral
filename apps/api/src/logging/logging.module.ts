import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { REDACTED_LOG_PATHS, REDACTION_CENSOR } from '../common/redaction.js';
import type { Environment } from '../config/environment.js';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => {
        const nodeEnv = config.get('NODE_ENV', { infer: true });

        return {
          pinoHttp: {
            level: config.get('LOG_LEVEL', { infer: true }),
            redact: {
              paths: [...REDACTED_LOG_PATHS],
              censor: REDACTION_CENSOR,
            },
            transport:
              nodeEnv === 'development'
                ? { target: 'pino-pretty', options: { singleLine: true } }
                : undefined,
          },
        };
      },
    }),
  ],
})
export class LoggingModule {}
