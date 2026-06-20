import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { makePayment } from '#test/factories/make-payment.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetPublicUserPaymentsUseCase } from './get-public-user-payments.use-case.js';

describe('GetPublicUserPaymentsUseCase', () => {
  let paymentsRepository: InMemoryPaymentsRepository;
  let profilesRepository: InMemoryProfilesRepository;
  let sut: GetPublicUserPaymentsUseCase;

  beforeEach(() => {
    paymentsRepository = new InMemoryPaymentsRepository();
    profilesRepository = new InMemoryProfilesRepository();
    sut = new GetPublicUserPaymentsUseCase(
      paymentsRepository,
      profilesRepository,
    );
  });

  it('should return payments for a public user', async () => {
    const profile = makeProfile({ username: 'alice' });
    profilesRepository.items.push(profile);
    paymentsRepository.items.push(makePayment({ profileId: profile.id }));

    const result = await sut.execute({ username: 'alice' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(1);
  });

  it('should return ResourceNotFoundError for unknown username', async () => {
    const result = await sut.execute({ username: 'nobody' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError when showActivity is false', async () => {
    const profile = makeProfile({ username: 'private_user' });
    const privacy = PrivacySettings.create({
      profileId: profile.id,
      showActivity: false,
    });
    profile.setPrivacySettings(privacy);
    profilesRepository.items.push(profile);
    paymentsRepository.items.push(makePayment({ profileId: profile.id }));

    const result = await sut.execute({ username: 'private_user' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should cap results at 8 items', async () => {
    const profile = makeProfile({ username: 'rich_user' });
    profilesRepository.items.push(profile);

    for (let i = 0; i < 12; i++) {
      paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    }

    const result = await sut.execute({ username: 'rich_user' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(8);
  });

  it('should cap results at 8 even when explicit limit is higher', async () => {
    const profile = makeProfile({ username: 'spender' });
    profilesRepository.items.push(profile);

    for (let i = 0; i < 10; i++) {
      paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    }

    const result = await sut.execute({ username: 'spender', limit: 50 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(8);
  });

  it('should return empty list when user has no payments', async () => {
    const profile = makeProfile({ username: 'broke_user' });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ username: 'broke_user' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(0);
  });
});
