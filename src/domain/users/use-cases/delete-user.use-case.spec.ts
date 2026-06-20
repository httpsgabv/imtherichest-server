import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUser } from '#test/factories/make-user.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { InMemoryUsersRepository } from '#test/users/in-memory-users-repository.js';
import { DeleteUserUseCase } from './delete-user.use-case.js';

describe('DeleteUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let profilesRepository: InMemoryProfilesRepository;
  let paymentsRepository: InMemoryPaymentsRepository;
  let achievementsRepository: InMemoryAchievementsRepository;
  let sut: DeleteUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    profilesRepository = new InMemoryProfilesRepository();
    paymentsRepository = new InMemoryPaymentsRepository();
    achievementsRepository = new InMemoryAchievementsRepository();
    sut = new DeleteUserUseCase(
      usersRepository,
      profilesRepository,
      paymentsRepository,
      achievementsRepository,
    );
  });

  it('should delete the user when it exists', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'));
    usersRepository.items.push(user);

    const result = await sut.execute({ requesterId: 'user-1' });

    expect(result.isSuccess()).toBe(true);
    expect(usersRepository.items).toHaveLength(0);
  });

  it('should delete the profile and its data when it exists', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'));
    const profile = makeProfile(
      { userId: new UniqueEntityID('user-1') },
      new UniqueEntityID('profile-1'),
    );
    usersRepository.items.push(user);
    profilesRepository.items.push(profile);

    const result = await sut.execute({ requesterId: 'user-1' });

    expect(result.isSuccess()).toBe(true);
    expect(usersRepository.items).toHaveLength(0);
    expect(profilesRepository.items).toHaveLength(0);
  });

  it('should fail with ResourceNotFoundError when user does not exist', async () => {
    const result = await sut.execute({ requesterId: 'user-1' });

    expect(result.isFailure()).toBe(true);
    expect((result as any).value.message).toBe('User not found');
  });
});
