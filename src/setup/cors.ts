import type { EnvService } from '#infra/env/env.service.js';
import type { INestApplication } from '@nestjs/common';

type CorsSetup = Pick<INestApplication, 'enableCors'>;

export class Cors {
  constructor(
    private readonly app: CorsSetup,
    private readonly env: EnvService,
  ) {}

  setup() {
    const options = this.env.getCorsOrigins();
    this.app.enableCors({
      origin: options,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    });
  }
}
