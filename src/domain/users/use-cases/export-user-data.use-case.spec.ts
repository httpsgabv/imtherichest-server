import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { makePayment } from '#test/factories/make-payment.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUser } from '#test/factories/make-user.js';
import { InMemoryUsersRepository } from '#test/users/in-memory-users-repository.js';
import type { UserExportData } from '../repositories/users-repository.js';
import { ExportUserDataUseCase } from './export-user-data.use-case.js';

describe('ExportUserDataUseCase', () => {
  let repository: InMemoryUsersRepository;
  let sut: ExportUserDataUseCase;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    sut = new ExportUserDataUseCase(repository);
  });

  it('should return all user data including profile, payments and achievements', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'));
    repository.items.push(user);

    const profile = makeProfile({ userId: new UniqueEntityID('user-1') });
    const exportData: UserExportData = {
      user,
      profile,
      payments: [makePayment({ profileId: profile.id, amount: 500 })],
      unlockedAchievements: ['first-purchase'],
    };
    repository.exportData.set('user-1', exportData);

    const result = await sut.execute({ requesterId: 'user-1' });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.user.id.toString()).toBe('user-1');
      expect(result.value.profile).toBe(profile);
      expect(result.value.payments).toHaveLength(1);
      expect(result.value.unlockedAchievements).toEqual(['first-purchase']);
    }
  });

  it('should return empty collections for a user with no data', async () => {
    const user = makeUser({}, new UniqueEntityID('user-2'));
    repository.items.push(user);
    repository.exportData.set('user-2', {
      user,
      profile: null,
      payments: [],
      unlockedAchievements: [],
    });

    const result = await sut.execute({ requesterId: 'user-2' });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.profile).toBeNull();
      expect(result.value.payments).toEqual([]);
      expect(result.value.unlockedAchievements).toEqual([]);
    }
  });

  it('should fail with ResourceNotFoundError when user does not exist', async () => {
    const result = await sut.execute({ requesterId: 'non-existent' });

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.value.message).toBe('User not found');
    }
  });
});
