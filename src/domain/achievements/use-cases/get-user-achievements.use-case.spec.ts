import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUserAchievement } from '#test/factories/make-user-achievement.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { achievementDefinitions } from '../data/achievement-definitions.js';
import { GetUserAchievementsUseCase } from './get-user-achievements.use-case.js';

const USER_ID = new UniqueEntityID('user-1');

describe('GetUserAchievementsUseCase', () => {
  let profilesRepository: InMemoryProfilesRepository;
  let achievementsRepository: InMemoryAchievementsRepository;
  let sut: GetUserAchievementsUseCase;

  beforeEach(() => {
    profilesRepository = new InMemoryProfilesRepository();
    achievementsRepository = new InMemoryAchievementsRepository();
    sut = new GetUserAchievementsUseCase(
      profilesRepository,
      achievementsRepository,
    );
  });

  it('should return all definitions plus the user unlocked ids', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);
    achievementsRepository.items.push(
      makeUserAchievement({
        profileId: profile.id,
        achievementId: 'first-purchase',
      }),
    );

    const result = await sut.execute({ userId: USER_ID });

    expect(result.definitions).toHaveLength(achievementDefinitions.length);
    expect(result.unlockedIds).toEqual(['first-purchase']);
  });

  it('should return an empty unlocked list when the user has no profile', async () => {
    const result = await sut.execute({ userId: USER_ID });

    expect(result.unlockedIds).toEqual([]);
    expect(result.definitions).toHaveLength(achievementDefinitions.length);
  });
});
