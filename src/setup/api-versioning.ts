import { VersioningType, type INestApplication } from '@nestjs/common';

type ApiVersioningSetup = Pick<INestApplication, 'enableVersioning'>;

export class ApiVersioning {
  constructor(private readonly app: ApiVersioningSetup) {}

  setup() {
    this.app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
    });
  }
}
