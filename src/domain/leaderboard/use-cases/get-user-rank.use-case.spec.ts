import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetUserRankUseCase } from './get-user-rank.use-case.js';

describe('GetUserRankUseCase', () => {
  let profilesRepository: InMemoryProfilesRepository;
  let leaderboardRepository: InMemoryLeaderboardRepository;
  let sut: GetUserRankUseCase;

  beforeEach(() => {
    profilesRepository = new InMemoryProfilesRepository();
    leaderboardRepository = new InMemoryLeaderboardRepository(
      profilesRepository.items,
    );
    sut = new GetUserRankUseCase(profilesRepository, leaderboardRepository);
  });

  it('should return ResourceNotFoundError for unknown username', async () => {
    const result = await sut.execute({ username: 'nobody' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return rank 1 and null nextRivalDelta for the sole user', async () => {
    const profile = makeProfile({ username: 'toplad', points: 100 });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ username: 'toplad' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.rank).toBe(1);
    expect(result.value.points).toBe(100);
    expect(result.value.nextRivalDelta).toBeNull();
  });

  it('should return correct rank when multiple users exist', async () => {
    const leader = makeProfile({ username: 'leader', points: 500 });
    const chaser = makeProfile({ username: 'chaser', points: 100 });
    profilesRepository.items.push(leader, chaser);

    const result = await sut.execute({ username: 'chaser' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.rank).toBe(2);
  });

  it('should return nextRivalDelta as the points gap to the user above', async () => {
    const leader = makeProfile({ username: 'leader', points: 500 });
    const chaser = makeProfile({ username: 'chaser', points: 100 });
    profilesRepository.items.push(leader, chaser);

    const result = await sut.execute({ username: 'chaser' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.nextRivalDelta).toBe(400);
  });

  it('should return the immediate rival delta, not the max gap', async () => {
    profilesRepository.items.push(
      makeProfile({ username: 'first', points: 1000 }),
      makeProfile({ username: 'second', points: 200 }),
      makeProfile({ username: 'third', points: 50 }),
    );

    const result = await sut.execute({ username: 'third' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    // third is at 50, second is at 200, rival delta should be 150 (not 950)
    expect(result.value.nextRivalDelta).toBe(150);
  });

  it('should return correct points for the queried user', async () => {
    const profile = makeProfile({ username: 'alice', points: 42 });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ username: 'alice' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.points).toBe(42);
  });

  it('should count all profiles (including private) toward rank', async () => {
    const { PrivacySettings } =
      await import('#domain/users/entities/privacy-settings.js');
    const privateTop = makeProfile({
      username: 'private_top',
      points: 1000,
      privacySettings: PrivacySettings.create({
        profileId: new UniqueEntityID(),
        publicProfile: false,
      }),
    });
    const publicChaser = makeProfile({
      username: 'public_chaser',
      points: 100,
    });
    profilesRepository.items.push(privateTop, publicChaser);

    const result = await sut.execute({ username: 'public_chaser' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    // private user has more points → public_chaser is rank 2
    expect(result.value.rank).toBe(2);
  });
});
