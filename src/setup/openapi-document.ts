import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { EnvService } from '#infra/env/env.service.js';

export function createOpenApiDocument(app: INestApplication, env: EnvService) {
  const openApiConfig = new DocumentBuilder()
    .setTitle(env.get('OPENAPI_APP_NAME'))
    .setDescription(env.get('OPENAPI_APP_DESCRIPTION'))
    .setVersion(env.get('APP_VERSION'))
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, openApiConfig);
}
