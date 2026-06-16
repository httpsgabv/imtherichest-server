import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import {
  EmailProvider,
  type SendPasswordResetEmailParams,
} from '#domain/email/ports/email.provider.js';
import { passwordResetTemplate } from './templates/password-reset.template.js';

export class ResendEmailProvider extends EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(apiKey: string, fromEmail: string, appName: string) {
    super();
    this.resend = new Resend(apiKey);
    this.from = `${appName} <${fromEmail}>`;
  }

  async sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: params.to,
      subject: 'Reset your password',
      html: passwordResetTemplate({ resetUrl: params.resetUrl }),
    });

    if (error) {
      this.logger.error(
        `Failed to send password reset email to ${params.to}: ${error.message}`,
      );
      throw new Error(error.message);
    }

    this.logger.log(`Password reset email sent to ${params.to}`);
  }
}
