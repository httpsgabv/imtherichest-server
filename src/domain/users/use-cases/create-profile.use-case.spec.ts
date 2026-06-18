import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { UsernameAlreadyTakenError } from '#domain/users/errors/username-already-taken.error.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { CreateProfileUseCase } from './create-profile.use-case.js';

const USER_1 = new UniqueEntityID('user-1');
const USER_2 = new UniqueEntityID('user-2');

describe('CreateProfileUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: CreateProfileUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new CreateProfileUseCase(repository);
  });

  it('should create a profile with the given fields', async () => {
    const result = await sut.execute({
      userId: USER_1,
      username: 'john_doe',
      displayName: 'John Doe',
    });

    expect(result.isSuccess()).toBe(true);
    expect(repository.items).toHaveLength(1);

    const profile = repository.items[0];
    expect(profile.userId.equals(USER_1)).toBe(true);
    expect(profile.username).toBe('john_doe');
    expect(profile.displayName).toBe('John Doe');
  });

  it('should initialize points, totalPaid, bio, and country to defaults', async () => {
    await sut.execute({
      userId: USER_1,
      username: 'john_doe',
      displayName: 'John Doe',
    });

    const profile = repository.items[0];
    expect(profile.points).toBe(0);
    expect(profile.totalPaid).toBe(0);
    expect(profile.bio).toBe('');
    expect(profile.country).toBe('');
    expect(profile.avatarUrl).toBeNull();
  });

  it('should return the created profile in the success value', async () => {
    const result = await sut.execute({
      userId: USER_1,
      username: 'john_doe',
      displayName: 'John Doe',
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile).toBe(repository.items[0]);
  });

  it('should return UsernameAlreadyTakenError when username is taken', async () => {
    const existing = makeProfile(
      { username: 'john_doe' },
      new UniqueEntityID('profile-1'),
    );
    repository.items.push(existing);

    const result = await sut.execute({
      userId: USER_2,
      username: 'john_doe',
      displayName: 'Jane Doe',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(UsernameAlreadyTakenError);
    expect((result.value as UsernameAlreadyTakenError).message).toBe(
      'Username "john_doe" is already taken.',
    );
  });

  it('should not persist the profile when username is already taken', async () => {
    const existing = makeProfile({ username: 'john_doe' });
    repository.items.push(existing);

    await sut.execute({
      userId: USER_2,
      username: 'john_doe',
      displayName: 'Jane Doe',
    });

    expect(repository.items).toHaveLength(1);
  });

  it('should allow different users to register with different usernames', async () => {
    await sut.execute({
      userId: USER_1,
      username: 'alice',
      displayName: 'Alice',
    });
    const result = await sut.execute({
      userId: USER_2,
      username: 'bob',
      displayName: 'Bob',
    });

    expect(result.isSuccess()).toBe(true);
    expect(repository.items).toHaveLength(2);
  });

  it('should assign a unique id to each created profile', async () => {
    await sut.execute({
      userId: USER_1,
      username: 'alice',
      displayName: 'Alice',
    });
    await sut.execute({ userId: USER_2, username: 'bob', displayName: 'Bob' });

    const [first, second] = repository.items;
    expect(first.id.toString()).not.toBe(second.id.toString());
  });

  it('should attach PrivacySettings with all defaults set to true', async () => {
    await sut.execute({
      userId: USER_1,
      username: 'john_doe',
      displayName: 'John Doe',
    });

    const profile = repository.items[0];
    expect(profile.privacySettings).toBeInstanceOf(PrivacySettings);
    expect(profile.privacySettings?.publicProfile).toBe(true);
    expect(profile.privacySettings?.showTotalPaid).toBe(true);
    expect(profile.privacySettings?.showAchievements).toBe(true);
    expect(profile.privacySettings?.showActivity).toBe(true);
  });

  it('should link PrivacySettings to the created profile id', async () => {
    await sut.execute({
      userId: USER_1,
      username: 'john_doe',
      displayName: 'John Doe',
    });

    const profile = repository.items[0];
    expect(profile.privacySettings?.profileId.equals(profile.id)).toBe(true);
  });
});
