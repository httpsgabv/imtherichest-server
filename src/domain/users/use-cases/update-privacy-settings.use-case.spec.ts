import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { UpdatePrivacySettingsUseCase } from './update-privacy-settings.use-case.js';

const USER_ID = 'user-abc';

describe('UpdatePrivacySettingsUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: UpdatePrivacySettingsUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new UpdatePrivacySettingsUseCase(repository);
  });

  it('should update publicProfile to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      publicProfile: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).privacySettings.publicProfile).toBe(false);
  });

  it('should update showTotalPaid to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      showTotalPaid: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).privacySettings.showTotalPaid).toBe(false);
  });

  it('should update showAchievements to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      showAchievements: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).privacySettings.showAchievements).toBe(false);
  });

  it('should update showActivity to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      showActivity: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).privacySettings.showActivity).toBe(false);
  });

  it('should update multiple fields at once', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      publicProfile: false,
      showTotalPaid: false,
    });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).privacySettings;
    expect(settings.publicProfile).toBe(false);
    expect(settings.showTotalPaid).toBe(false);
    expect(settings.showAchievements).toBe(true);
    expect(settings.showActivity).toBe(true);
  });

  it('should not change fields that are not provided', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      publicProfile: false,
    });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).privacySettings;
    expect(settings.showTotalPaid).toBe(true);
    expect(settings.showAchievements).toBe(true);
    expect(settings.showActivity).toBe(true);
  });

  it('should persist the updated settings in the repository', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    await sut.execute({ requesterId: USER_ID, publicProfile: false });

    expect(repository.items[0].privacySettings?.publicProfile).toBe(false);
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({
      requesterId: USER_ID,
      publicProfile: false,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not update another user's privacy settings", async () => {
    repository.items.push(
      makeProfile({ userId: new UniqueEntityID('other-user') }),
    );

    const result = await sut.execute({
      requesterId: USER_ID,
      publicProfile: false,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
