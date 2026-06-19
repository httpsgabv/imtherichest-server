import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { UpdateProfileUseCase } from './update-profile.use-case.js';

const USER_ID = 'user-abc';

describe('UpdateProfileUseCase', () => {
  let repository: InMemoryProfilesRepository;
  let sut: UpdateProfileUseCase;

  beforeEach(() => {
    repository = new InMemoryProfilesRepository();
    sut = new UpdateProfileUseCase(repository);
  });

  it('should update displayName', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      displayName: 'New Name',
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile.displayName).toBe('New Name');
  });

  it('should update bio', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({ requesterId: USER_ID, bio: 'My bio' });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile.bio).toBe('My bio');
  });

  it('should update country', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({ requesterId: USER_ID, country: 'DE' });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile.country).toBe('DE');
  });

  it('should update avatarUrl', async () => {
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile.avatarUrl).toBe(
      'https://example.com/avatar.png',
    );
  });

  it('should clear avatarUrl when null is passed', async () => {
    repository.items.push(
      makeProfile({
        userId: new UniqueEntityID(USER_ID),
        avatarUrl: 'https://example.com/old.png',
      }),
    );

    const result = await sut.execute({
      requesterId: USER_ID,
      avatarUrl: null,
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).profile.avatarUrl).toBeNull();
  });

  it('should not change fields that are not provided', async () => {
    repository.items.push(
      makeProfile({
        userId: new UniqueEntityID(USER_ID),
        displayName: 'Original',
        bio: 'Original bio',
        country: 'US',
      }),
    );

    const result = await sut.execute({
      requesterId: USER_ID,
      country: 'BR',
    });

    expect(result.isSuccess()).toBe(true);
    const profile = (result.value as any).profile;
    expect(profile.displayName).toBe('Original');
    expect(profile.bio).toBe('Original bio');
    expect(profile.country).toBe('BR');
  });

  it('should set updatedAt after update', async () => {
    const before = new Date();
    repository.items.push(makeProfile({ userId: new UniqueEntityID(USER_ID) }));

    const result = await sut.execute({
      requesterId: USER_ID,
      displayName: 'Updated',
    });

    expect(result.isSuccess()).toBe(true);
    const updatedAt = (result.value as any).profile.updatedAt;
    expect(updatedAt).toBeDefined();
    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should persist the updated profile in the repository', async () => {
    const profile = makeProfile({ userId: new UniqueEntityID(USER_ID) });
    repository.items.push(profile);

    await sut.execute({ requesterId: USER_ID, displayName: 'Persisted' });

    expect(repository.items[0].displayName).toBe('Persisted');
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({
      requesterId: USER_ID,
      displayName: 'Ghost',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not update another user's profile", async () => {
    repository.items.push(
      makeProfile({ userId: new UniqueEntityID('other-user') }),
    );

    const result = await sut.execute({
      requesterId: USER_ID,
      displayName: 'Hacked',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
