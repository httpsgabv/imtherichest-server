import { INestApplication } from '@nestjs/common';
import { EnvService } from '#infra/env/env.service.js';
import helmet from 'helmet';

export class Helmet {
  constructor(
    private readonly app: INestApplication,
    private readonly env: EnvService,
  ) {}

  setup() {
    const isProduction = this.env.isProduction();
    this.app.use(
      helmet({
        contentSecurityPolicy: isProduction
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https:'],
              },
            }
          : false,
      }),
    );
  }
}
