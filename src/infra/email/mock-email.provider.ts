import { Logger } from '@nestjs/common';
import {
  EmailProvider,
  type SendPasswordResetEmailParams,
} from '#domain/email/ports/email.provider.js';

export class MockEmailProvider extends EmailProvider {
  private readonly logger = new Logger(MockEmailProvider.name);

  async sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<void> {
    this.logger.log(
      `[MOCK] Password reset email → to: ${params.to}, url: ${params.resetUrl}`,
    );
  }
}
