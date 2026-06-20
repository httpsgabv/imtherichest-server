import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makePayment } from '#test/factories/make-payment.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetUserPaymentsUseCase } from './get-user-payments.use-case.js';

const USER_ID = new UniqueEntityID('user-1');

describe('GetUserPaymentsUseCase', () => {
  let paymentsRepository: InMemoryPaymentsRepository;
  let profilesRepository: InMemoryProfilesRepository;
  let sut: GetUserPaymentsUseCase;

  beforeEach(() => {
    paymentsRepository = new InMemoryPaymentsRepository();
    profilesRepository = new InMemoryProfilesRepository();
    sut = new GetUserPaymentsUseCase(paymentsRepository, profilesRepository);
  });

  it('should return empty list when user has no payments', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ userId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(0);
    expect(result.value.nextCursor).toBeNull();
  });

  it('should return payments ordered by createdAt descending', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    const older = makePayment({
      profileId: profile.id,
      createdAt: new Date('2024-01-01'),
    });
    const newer = makePayment({
      profileId: profile.id,
      createdAt: new Date('2024-06-01'),
    });
    paymentsRepository.items.push(older, newer);

    const result = await sut.execute({ userId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments[0].id.equals(newer.id)).toBe(true);
    expect(result.value.payments[1].id.equals(older.id)).toBe(true);
  });

  it('should respect limit and return nextCursor when more exist', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    for (let i = 0; i < 5; i++) {
      paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    }

    const result = await sut.execute({ userId: USER_ID, limit: 3 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(3);
    expect(result.value.nextCursor).not.toBeNull();
  });

  it('should return null nextCursor when on last page', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    paymentsRepository.items.push(makePayment({ profileId: profile.id }));

    const result = await sut.execute({ userId: USER_ID, limit: 5 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(2);
    expect(result.value.nextCursor).toBeNull();
  });

  it('should cap limit at 100', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    for (let i = 0; i < 110; i++) {
      paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    }

    const result = await sut.execute({ userId: USER_ID, limit: 200 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(100);
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({ userId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should only return payments for the requesting user', async () => {
    const profile = makeProfile({ userId: USER_ID });
    const other = makeProfile({ userId: new UniqueEntityID('user-2') });
    profilesRepository.items.push(profile, other);

    paymentsRepository.items.push(makePayment({ profileId: profile.id }));
    paymentsRepository.items.push(makePayment({ profileId: other.id }));

    const result = await sut.execute({ userId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payments).toHaveLength(1);
    expect(result.value.payments[0].profileId.equals(profile.id)).toBe(true);
  });
});
