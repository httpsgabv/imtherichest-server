import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetProfileByUsernameUseCase } from './get-profile-by-username.use-case.js';

const OWNER_ID = new UniqueEntityID('user-1');

describe('GetProfileByUsernameUseCase', () => {
  let profilesRepository: InMemoryProfilesRepository;
  let leaderboardRepository: InMemoryLeaderboardRepository;
  let sut: GetProfileByUsernameUseCase;

  beforeEach(() => {
    profilesRepository = new InMemoryProfilesRepository();
    leaderboardRepository = new InMemoryLeaderboardRepository(
      profilesRepository.items,
    );
    sut = new GetProfileByUsernameUseCase(
      profilesRepository,
      leaderboardRepository,
    );
  });

  it('should return ResourceNotFoundError when the username is unknown', async () => {
    const result = await sut.execute({ username: 'ghost' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return a public profile with its rank to an anonymous caller', async () => {
    profilesRepository.items.push(
      makeProfile({ username: 'alice', points: 0 }),
    );
    profilesRepository.items.push(makeProfile({ points: 500 }));

    const result = await sut.execute({ username: 'alice' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.profile.username).toBe('alice');
    expect(result.value.rank).toBe(2); // one profile has more points
    expect(result.value.isOwner).toBe(false);
  });

  it('should hide a non-public profile from anonymous callers (404)', async () => {
    profilesRepository.items.push(
      makeProfile({
        username: 'private_alice',
        privacySettings: PrivacySettings.create({
          profileId: new UniqueEntityID(),
          publicProfile: false,
        }),
      }),
    );

    const result = await sut.execute({ username: 'private_alice' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should hide a non-public profile from a different authenticated user', async () => {
    profilesRepository.items.push(
      makeProfile({
        username: 'private_alice',
        userId: OWNER_ID,
        privacySettings: PrivacySettings.create({
          profileId: new UniqueEntityID(),
          publicProfile: false,
        }),
      }),
    );

    const result = await sut.execute({
      username: 'private_alice',
      requesterId: 'someone-else',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return a non-public profile to its owner with isOwner true', async () => {
    profilesRepository.items.push(
      makeProfile({
        username: 'private_alice',
        userId: OWNER_ID,
        privacySettings: PrivacySettings.create({
          profileId: new UniqueEntityID(),
          publicProfile: false,
        }),
      }),
    );

    const result = await sut.execute({
      username: 'private_alice',
      requesterId: OWNER_ID.toString(),
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.isOwner).toBe(true);
    expect(result.value.profile.username).toBe('private_alice');
  });
});
