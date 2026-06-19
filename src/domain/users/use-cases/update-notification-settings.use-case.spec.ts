import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { UpdateNotificationSettingsUseCase } from './update-notification-settings.use-case.js';

const USER_ID = 'user-abc';

describe('UpdateNotificationSettingsUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: UpdateNotificationSettingsUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new UpdateNotificationSettingsUseCase(repository);
  });

  it('should update achievementAlerts to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      achievementAlerts: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).notificationSettings.achievementAlerts).toBe(
      false,
    );
  });

  it('should update rankAlerts to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      rankAlerts: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).notificationSettings.rankAlerts).toBe(false);
  });

  it('should update paymentConfirmations to false', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      paymentConfirmations: false,
    });

    expect(result.isSuccess()).toBe(true);
    expect(
      (result.value as any).notificationSettings.paymentConfirmations,
    ).toBe(false);
  });

  it('should update marketingEmails to true', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      marketingEmails: true,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).notificationSettings.marketingEmails).toBe(
      true,
    );
  });

  it('should update multiple fields at once', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      achievementAlerts: false,
      marketingEmails: true,
    });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).notificationSettings;
    expect(settings.achievementAlerts).toBe(false);
    expect(settings.rankAlerts).toBe(true);
    expect(settings.paymentConfirmations).toBe(true);
    expect(settings.marketingEmails).toBe(true);
  });

  it('should not change fields that are not provided', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      achievementAlerts: false,
    });

    expect(result.isSuccess()).toBe(true);
    const settings = (result.value as any).notificationSettings;
    expect(settings.rankAlerts).toBe(true);
    expect(settings.paymentConfirmations).toBe(true);
    expect(settings.marketingEmails).toBe(false);
  });

  it('should persist the updated settings in the repository', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    await sut.execute({ requesterId: USER_ID, achievementAlerts: false });

    expect(repository.items[0].notificationSettings?.achievementAlerts).toBe(
      false,
    );
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({
      requesterId: USER_ID,
      achievementAlerts: false,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not update another user's notification settings", async () => {
    repository.items.push(
      makeProfile({ userId: new UniqueEntityID('other-user') }),
    );

    const result = await sut.execute({
      requesterId: USER_ID,
      achievementAlerts: false,
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
