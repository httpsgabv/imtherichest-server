import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUserAchievement } from '#test/factories/make-user-achievement.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { achievementDefinitions } from '../data/achievement-definitions.js';
import { GetPublicUserAchievementsUseCase } from './get-public-user-achievements.use-case.js';

describe('GetPublicUserAchievementsUseCase', () => {
  let profilesRepository: InMemoryProfilesRepository;
  let achievementsRepository: InMemoryAchievementsRepository;
  let sut: GetPublicUserAchievementsUseCase;

  beforeEach(() => {
    profilesRepository = new InMemoryProfilesRepository();
    achievementsRepository = new InMemoryAchievementsRepository();
    sut = new GetPublicUserAchievementsUseCase(
      profilesRepository,
      achievementsRepository,
    );
  });

  it('should return ResourceNotFoundError when the username is unknown', async () => {
    const result = await sut.execute({ username: 'ghost' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError when showAchievements is disabled', async () => {
    const profile = makeProfile({
      username: 'private_user',
      privacySettings: PrivacySettings.create({
        profileId: new UniqueEntityID(),
        showAchievements: false,
      }),
    });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ username: 'private_user' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return definitions and unlocked ids for a public profile', async () => {
    const profile = makeProfile({ username: 'public_user' });
    profilesRepository.items.push(profile);
    achievementsRepository.items.push(
      makeUserAchievement({
        profileId: profile.id,
        achievementId: 'rank-1',
      }),
    );

    const result = await sut.execute({ username: 'public_user' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.unlockedIds).toEqual(['rank-1']);
    expect(result.value.definitions).toHaveLength(
      achievementDefinitions.length,
    );
  });
});
