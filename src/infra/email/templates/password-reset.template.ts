export function passwordResetTemplate({
  resetUrl,
}: {
  resetUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:40px 0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
    <h1 style="margin:0 0 8px;font-size:22px;color:#18181b;font-weight:600;">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#71717a;line-height:1.6;">
      We received a request to reset the password for your account.
      Click the button below to choose a new password.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:500;">
      Reset password
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;line-height:1.6;">
      This link expires in 1 hour. If you didn't request a password reset,
      you can safely ignore this email — your password will not change.
    </p>
  </div>
</body>
</html>`;
}
