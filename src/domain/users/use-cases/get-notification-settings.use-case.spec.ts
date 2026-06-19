import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { GetNotificationSettingsUseCase } from './get-notification-settings.use-case.js';

const USER_ID = 'user-abc';

describe('GetNotificationSettingsUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: GetNotificationSettingsUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new GetNotificationSettingsUseCase(repository);
  });

  it('should return the notification settings for the requesting user', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).notificationSettings).toBe(
      profile.notificationSettings,
    );
  });

  it('should return default notification settings values', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).notificationSettings;
    expect(settings.achievementAlerts).toBe(true);
    expect(settings.rankAlerts).toBe(true);
    expect(settings.paymentConfirmations).toBe(true);
    expect(settings.marketingEmails).toBe(false);
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not return another user's notification settings", async () => {
    repository.items.push(
      makeProfile({ userId: new UniqueEntityID('other-user') }),
    );

    const result = await sut.execute({ requesterId: USER_ID });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
