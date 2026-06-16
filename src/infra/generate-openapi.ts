import '#infra/sentry/instrument.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '#infra/app.module.js';
import { EnvService } from '#infra/env/env.service.js';
import { ApiVersioning } from '#setup/api-versioning.js';
import { GlobalPrefix } from '#setup/global-prefix.js';
import { createOpenApiDocument } from '#setup/openapi-document.js';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    bodyParser: false,
  });

  try {
    const env = app.get(EnvService);

    new ApiVersioning(app).setup();
    new GlobalPrefix(app, env).setup();

    const document = createOpenApiDocument(app, env);
    const outputPath = resolve(process.argv[2] ?? 'openapi.json');

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`);

    console.log(`OpenAPI spec written to ${outputPath}`);
  } finally {
    await app.close();
  }
}

generateOpenApi().catch((error) => {
  console.error(error);
  process.exit(1);
});
