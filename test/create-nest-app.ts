import type { INestApplication } from '@nestjs/common';

export async function createNestApp(): Promise<INestApplication> {
  const { Test } = await import('@nestjs/testing');
  const { AppModule } = await import('#infra/app.module.js');
  const { EnvService } = await import('#infra/env/env.service.js');
  const { ApiVersioning } = await import('#setup/api-versioning.js');
  const { GlobalPrefix } = await import('#setup/global-prefix.js');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  const env = app.get(EnvService);

  new ApiVersioning(app).setup();
  new GlobalPrefix(app, env).setup();

  await app.init();

  return app;
}
