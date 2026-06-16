import '#infra/sentry/instrument.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '#infra/app.module.js';
import { Cors } from '#setup/cors.js';
import { EnvService } from '#infra/env/env.service.js';
import { GlobalPrefix } from '#setup/global-prefix.js';
import { Logger } from 'nestjs-pino';
import { Scalar } from '#setup/scalar.js';
import { Helmet } from '#setup/helmet.js';
import { ApiVersioning } from '#setup/api-versioning.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));

  const env = app.get(EnvService);

  const helmet = new Helmet(app, env);
  helmet.setup();

  const apiVersioning = new ApiVersioning(app);
  apiVersioning.setup();

  const cors = new Cors(app, env);
  cors.setup();

  const globalPrefix = new GlobalPrefix(app, env);
  globalPrefix.setup();

  const scalar = new Scalar(app, env);
  scalar.setup();

  await app.listen(env.get('PORT'));
}

bootstrap()
  .then(() => {
    console.log(`App running on port ${process.env.PORT}`);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
