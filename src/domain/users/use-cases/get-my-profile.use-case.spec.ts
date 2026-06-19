import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetMyProfileUseCase } from './get-my-profile.use-case.js';

const USER_ID = 'user-abc';

describe('GetMyProfileUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: GetMyProfileUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new GetMyProfileUseCase(repository);
  });

  it('should return the profile for the requesting user', async () => {
    const profile = makeProfile(
      { userId: new UniqueEntityID(USER_ID), username: 'johndoe' },
      new UniqueEntityID('profile-1'),
    );
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile).toBe(profile);
  });

  it('should include privacySettings on the returned profile', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    const returned = (result.value as any).profile;
    expect(returned.privacySettings).not.toBeNull();
    expect(returned.privacySettings.publicProfile).toBe(true);
  });

  it('should include notificationSettings on the returned profile', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    const returned = (result.value as any).profile;
    expect(returned.notificationSettings).not.toBeNull();
    expect(returned.notificationSettings.achievementAlerts).toBe(true);
  });

  it('should return ResourceNotFoundError when no profile exists for the user', async () => {
    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not return another user's profile", async () => {
    const profile = makeProfile({ userId: new UniqueEntityID('other-user') });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
