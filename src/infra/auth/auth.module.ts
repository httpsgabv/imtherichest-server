import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '#lib/auth.js';
import { SignUpWithEmailUseCase } from '#domain/auth/use-cases/sign-up-with-email.use-case.js';
import { SignInWithEmailUseCase } from '#domain/auth/use-cases/sign-in-with-email.use-case.js';
import { GetSessionUseCase } from '#domain/auth/use-cases/get-session.use-case.js';
import { SignOutUseCase } from '#domain/auth/use-cases/sign-out.use-case.js';
import { RequestPasswordResetUseCase } from '#domain/auth/use-cases/request-password-reset.use-case.js';
import { UpdatePasswordUseCase } from '#domain/auth/use-cases/update-password.use-case.js';
import { BetterAuthIdentityProvider } from './better-auth-identity.provider.js';
import { SignUpWithEmailController } from './controllers/sign-up-with-email.controller.js';
import { SignInWithEmailController } from './controllers/sign-in-with-email.controller.js';
import { GetSessionController } from './controllers/get-session.controller.js';
import { SignOutController } from './controllers/sign-out.controller.js';
import { RequestPasswordResetController } from './controllers/request-password-reset.controller.js';
import { UpdatePasswordController } from './controllers/update-password.controller.js';
import { AuthIdentityProvider } from '#domain/auth/ports/auth-identity.provider.js';
import { UsersModule } from '#infra/users/users.module.js';

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
      bodyParser: {
        json: {
          limit: '2mb',
        },
        urlencoded: {
          extended: true,
          limit: '2mb',
        },
      },
    }),
    UsersModule,
  ],
  controllers: [
    SignUpWithEmailController,
    SignInWithEmailController,
    GetSessionController,
    SignOutController,
    RequestPasswordResetController,
    UpdatePasswordController,
  ],
  providers: [
    SignUpWithEmailUseCase,
    SignInWithEmailUseCase,
    GetSessionUseCase,
    SignOutUseCase,
    RequestPasswordResetUseCase,
    UpdatePasswordUseCase,
    {
      provide: AuthIdentityProvider,
      useClass: BetterAuthIdentityProvider,
    },
  ],
  exports: [BetterAuthModule, SignUpWithEmailUseCase, SignInWithEmailUseCase],
})
export class AuthModule {}
