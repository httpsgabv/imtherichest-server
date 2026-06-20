import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { GetLeaderboardUseCase } from './get-leaderboard.use-case.js';

describe('GetLeaderboardUseCase', () => {
  let profiles: ReturnType<typeof makeProfile>[];
  let leaderboardRepository: InMemoryLeaderboardRepository;
  let sut: GetLeaderboardUseCase;

  beforeEach(() => {
    profiles = [];
    leaderboardRepository = new InMemoryLeaderboardRepository(profiles);
    sut = new GetLeaderboardUseCase(leaderboardRepository);
  });

  it('should return an empty leaderboard when no profiles exist', async () => {
    const result = await sut.execute({});

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(0);
    expect(result.value.total).toBe(0);
    expect(result.value.nextCursor).toBeNull();
  });

  it('should return profiles sorted by points descending', async () => {
    profiles.push(
      makeProfile({ username: 'alice', points: 10 }),
      makeProfile({ username: 'bob', points: 50 }),
      makeProfile({ username: 'carol', points: 30 }),
    );

    const result = await sut.execute({});

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    const usernames = result.value.entries.map((e) => e.profile.username);
    expect(usernames).toEqual(['bob', 'carol', 'alice']);
  });

  it('should exclude profiles with publicProfile = false', async () => {
    const privateProfile = makeProfile({
      username: 'secret',
      points: 999,
      privacySettings: PrivacySettings.create({
        profileId: new UniqueEntityID(),
        publicProfile: false,
      }),
    });
    profiles.push(
      privateProfile,
      makeProfile({ username: 'public_user', points: 10 }),
    );

    const result = await sut.execute({});

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(1);
    expect(result.value.entries[0]?.profile.username).toBe('public_user');
  });

  it('should return correct rank for each entry', async () => {
    profiles.push(
      makeProfile({ points: 100 }),
      makeProfile({ points: 50 }),
      makeProfile({ points: 200 }),
    );

    const result = await sut.execute({});

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries[0]?.rank).toBe(1);
    expect(result.value.entries[1]?.rank).toBe(2);
    expect(result.value.entries[2]?.rank).toBe(3);
  });

  it('should use default limit of 100', async () => {
    for (let i = 0; i < 120; i++) {
      profiles.push(makeProfile({ points: i }));
    }

    const result = await sut.execute({});

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(100);
    expect(result.value.nextCursor).toBe(100);
  });

  it('should clamp limit to max 200', async () => {
    for (let i = 0; i < 250; i++) {
      profiles.push(makeProfile({ points: i }));
    }

    const result = await sut.execute({ limit: 999 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(200);
  });

  it('should paginate using cursor', async () => {
    for (let i = 0; i < 5; i++) {
      profiles.push(makeProfile({ points: (5 - i) * 10 }));
    }

    const page1 = await sut.execute({ limit: 2 });
    expect(page1.isSuccess()).toBe(true);
    if (!page1.isSuccess()) return;
    expect(page1.value.entries).toHaveLength(2);
    expect(page1.value.nextCursor).toBe(2);

    const page2 = await sut.execute({ limit: 2, cursor: 2 });
    expect(page2.isSuccess()).toBe(true);
    if (!page2.isSuccess()) return;
    expect(page2.value.entries).toHaveLength(2);
    expect(page2.value.nextCursor).toBe(4);
  });

  it('should return null nextCursor on the last page', async () => {
    profiles.push(makeProfile({ points: 10 }), makeProfile({ points: 20 }));

    const result = await sut.execute({ limit: 5 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.nextCursor).toBeNull();
  });

  it('should filter by search matching username', async () => {
    profiles.push(
      makeProfile({ username: 'johndoe', points: 100 }),
      makeProfile({ username: 'janedoe', points: 50 }),
      makeProfile({ username: 'alice', points: 200 }),
    );

    const result = await sut.execute({ search: 'doe' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(2);
    expect(result.value.total).toBe(2);
  });

  it('should filter by search matching displayName', async () => {
    profiles.push(
      makeProfile({ displayName: 'John Smith', points: 100 }),
      makeProfile({ displayName: 'Jane Doe', points: 50 }),
    );

    const result = await sut.execute({ search: 'smith' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.entries).toHaveLength(1);
    expect(result.value.entries[0]?.profile.displayName).toBe('John Smith');
  });
});
