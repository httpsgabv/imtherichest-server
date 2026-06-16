export type SendPasswordResetEmailParams = {
  to: string;
  resetUrl: string;
};

export abstract class EmailProvider {
  abstract sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<void>;
}
