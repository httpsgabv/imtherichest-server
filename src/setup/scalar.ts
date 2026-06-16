import { EnvService } from '#infra/env/env.service.js';
import { SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { createOpenApiDocument } from '#setup/openapi-document.js';

export class Scalar {
  constructor(
    private readonly app: INestApplication,
    private readonly env: EnvService,
  ) {}

  setup() {
    const openApiDocument = createOpenApiDocument(this.app, this.env);

    SwaggerModule.setup('openapi', this.app, openApiDocument, {
      ui: false,
      jsonDocumentUrl: 'openapi.json',
    });

    this.app.use(
      '/reference',
      apiReference({
        content: openApiDocument,
        theme: 'purple',
      }),
    );
  }
}
