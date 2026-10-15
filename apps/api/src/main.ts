import 'reflect-metadata';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import type { Environment } from './config/environment.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Environment, true>);

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }) });
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('GGCentral API')
        .setDescription('HTTP API for the GGCentral gaming identity platform.')
        .setVersion('0.0.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(config.get('PORT', { infer: true }));
}

await bootstrap();
