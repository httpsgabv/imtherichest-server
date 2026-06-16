import type { EnvService } from '#infra/env/env.service.js';
import type { INestApplication } from '@nestjs/common';

type GlobalPrefixSetup = Pick<INestApplication, 'setGlobalPrefix'>;

export class GlobalPrefix {
  constructor(
    private readonly app: GlobalPrefixSetup,
    private readonly env: EnvService,
  ) {}

  setup() {
    this.app.setGlobalPrefix(this.env.get('GLOBAL_PREFIX'));
  }
}
