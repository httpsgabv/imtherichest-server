import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetPrivacySettingsUseCase } from './get-privacy-settings.use-case.js';

const USER_ID = 'user-abc';

describe('GetPrivacySettingsUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: GetPrivacySettingsUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new GetPrivacySettingsUseCase(repository);
  });

  it('should return the privacy settings for the requesting user', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).privacySettings).toBe(profile.privacySettings);
  });

  it('should return default privacy settings values', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).privacySettings;
    expect(settings.publicProfile).toBe(true);
    expect(settings.showTotalPaid).toBe(true);
    expect(settings.showAchievements).toBe(true);
    expect(settings.showActivity).toBe(true);
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not return another user's privacy settings", async () => {
    repository.items.push(
      makeProfile({ userId: new UniqueEntityID('other-user') }),
    );

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
