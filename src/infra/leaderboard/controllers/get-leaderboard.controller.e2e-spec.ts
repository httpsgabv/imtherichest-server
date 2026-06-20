import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

type LeaderboardUser = {
  rank: number;
  username: string;
  displayName: string;
  points: number;
  totalPaid: number | null;
  country: string;
  avatarUrl: string | null;
  achievements: string[];
};

type LeaderboardBody = {
  users: LeaderboardUser[];
  total: number;
  nextCursor: number | null;
};

async function signUpAndGetCookies(
  server: Server,
  email: string,
  username: string,
): Promise<string[]> {
  const res = await request(server).post('/api/v1/auth/sign-up/email').send({
    username,
    email,
    password: '12345678',
  });
  return res.headers['set-cookie'] as unknown as string[];
}

async function makePayment(
  server: Server,
  cookies: string[],
  amountInCents: number,
): Promise<void> {
  await request(server)
    .post('/api/v1/payments')
    .set('Cookie', cookies)
    .send({ amountInCents });
}

describe('GetLeaderboard (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/leaderboard → 200 with empty leaderboard', async () => {
    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    expect(body.users).toBeInstanceOf(Array);
    expect(body.total).toBeGreaterThanOrEqual(0);
    expect(
      body.nextCursor === null || typeof body.nextCursor === 'number',
    ).toBe(true);
  });

  it('[GET] /api/v1/leaderboard → 200 accessible without auth', async () => {
    const response = await request(server).get('/api/v1/leaderboard');

    expect(response.status).toBe(200);
  });

  it('[GET] /api/v1/leaderboard → returns users sorted by points descending', async () => {
    const lowCookies = await signUpAndGetCookies(
      server,
      'lb-low@example.com',
      'lb_low',
    );
    const highCookies = await signUpAndGetCookies(
      server,
      'lb-high@example.com',
      'lb_high',
    );

    await makePayment(server, lowCookies, 100);
    await makePayment(server, highCookies, 50000);

    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    const usernames = body.users.map((u) => u.username);
    const lowIdx = usernames.indexOf('lb_low');
    const highIdx = usernames.indexOf('lb_high');
    expect(highIdx).toBeLessThan(lowIdx);
  });

  it('[GET] /api/v1/leaderboard → each entry has the expected shape', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'lb-shape@example.com',
      'lb_shape',
    );
    await makePayment(server, cookies, 500);

    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    const entry = body.users.find((u) => u.username === 'lb_shape');
    expect(entry).toBeDefined();
    expect(typeof entry?.rank).toBe('number');
    expect(typeof entry?.username).toBe('string');
    expect(typeof entry?.displayName).toBe('string');
    expect(typeof entry?.points).toBe('number');
    expect(entry?.country).toBeDefined();
    expect(entry?.achievements).toBeInstanceOf(Array);
  });

  it('[GET] /api/v1/leaderboard → excludes users with publicProfile = false', async () => {
    const privateCookies = await signUpAndGetCookies(
      server,
      'lb-private@example.com',
      'lb_private',
    );
    await makePayment(server, privateCookies, 100);
    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', privateCookies)
      .send({ publicProfile: false });

    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    const usernames = body.users.map((u) => u.username);
    expect(usernames).not.toContain('lb_private');
  });

  it('[GET] /api/v1/leaderboard → hides totalPaid when showTotalPaid = false', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'lb-nototal@example.com',
      'lb_nototal',
    );
    await makePayment(server, cookies, 100);
    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ showTotalPaid: false });

    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    const entry = body.users.find((u) => u.username === 'lb_nototal');
    expect(entry).toBeDefined();
    expect(entry?.totalPaid).toBeNull();
  });

  it('[GET] /api/v1/leaderboard → hides achievements when showAchievements = false', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'lb-noach@example.com',
      'lb_noach',
    );
    await makePayment(server, cookies, 100);
    await request(server)
      .patch('/api/v1/users/me/settings/privacy')
      .set('Cookie', cookies)
      .send({ showAchievements: false });

    const response = await request(server).get('/api/v1/leaderboard');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    const entry = body.users.find((u) => u.username === 'lb_noach');
    expect(entry).toBeDefined();
    expect(entry?.achievements).toEqual([]);
  });

  it('[GET] /api/v1/leaderboard?limit=1 → returns nextCursor when more results exist', async () => {
    // Ensure at least 2 public users have payments
    const a = await signUpAndGetCookies(server, 'lb-pg1@example.com', 'lb_pg1');
    const b = await signUpAndGetCookies(server, 'lb-pg2@example.com', 'lb_pg2');
    await makePayment(server, a, 100);
    await makePayment(server, b, 100);

    const response = await request(server).get('/api/v1/leaderboard?limit=1');
    const body = response.body as LeaderboardBody;

    expect(response.status).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.nextCursor).not.toBeNull();
  });

  it('[GET] /api/v1/leaderboard?cursor=N → fetches next page', async () => {
    const p1 = await signUpAndGetCookies(server, 'lb-p1@example.com', 'lb_p1');
    const p2 = await signUpAndGetCookies(server, 'lb-p2@example.com', 'lb_p2');
    await makePayment(server, p1, 200);
    await makePayment(server, p2, 100);

    const page1 = await request(server).get('/api/v1/leaderboard?limit=1');
    const body1 = page1.body as LeaderboardBody;
    expect(page1.status).toBe(200);
    const cursor = body1.nextCursor;
    expect(cursor).not.toBeNull();

    const page2 = await request(server).get(
      `/api/v1/leaderboard?limit=1&cursor=${cursor}`,
    );
    const body2 = page2.body as LeaderboardBody;
    expect(page2.status).toBe(200);
    expect(body2.users).toHaveLength(1);
    // Pages should not return the same first user
    expect(body2.users[0]?.username).not.toBe(body1.users[0]?.username);
  });

  it('[GET] /api/v1/leaderboard?search= → filters by username', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'lb-search@example.com',
      'lb_searchable',
    );
    await makePayment(server, cookies, 100);

    const response = await request(server).get(
      '/api/v1/leaderboard?search=lb_searchable',
    );

    const body = response.body as LeaderboardBody;
    expect(response.status).toBe(200);
    expect(body.users.some((u) => u.username === 'lb_searchable')).toBe(true);
  });

  it('[GET] /api/v1/leaderboard → 400 when limit exceeds 200', async () => {
    const response = await request(server).get('/api/v1/leaderboard?limit=201');

    expect(response.status).toBe(400);
  });

  it('[GET] /api/v1/leaderboard → 400 when limit is 0', async () => {
    const response = await request(server).get('/api/v1/leaderboard?limit=0');

    expect(response.status).toBe(400);
  });
});
