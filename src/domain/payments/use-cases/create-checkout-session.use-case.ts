import { Injectable } from '@nestjs/common';
import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { InvalidAmountError } from '../errors/invalid-amount.error.js';
import { CheckoutProvider } from '../ports/checkout.provider.js';

export type CreateCheckoutSessionUseCaseRequest = {
  userId: UniqueEntityID;
  amountInCents: number;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutSessionUseCaseResult = Either<
  InvalidAmountError | ResourceNotFoundError,
  { checkoutUrl: string; sessionId: string }
>;

@Injectable()
export class CreateCheckoutSessionUseCase implements UseCase<
  CreateCheckoutSessionUseCaseRequest,
  CreateCheckoutSessionUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly checkoutProvider: CheckoutProvider,
  ) {}

  async execute(
    params: CreateCheckoutSessionUseCaseRequest,
  ): Promise<CreateCheckoutSessionUseCaseResult> {
    const { userId, amountInCents, successUrl, cancelUrl } = params;

    if (!Number.isInteger(amountInCents) || amountInCents < 100) {
      return failure(new InvalidAmountError());
    }

    const profile = await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found.'));
    }

    const result = await this.checkoutProvider.createSession({
      amountInCents,
      successUrl,
      cancelUrl,
      metadata: {
        userId: userId.toString(),
        profileId: profile.id.toString(),
      },
    });

    return success(result);
  }
}
