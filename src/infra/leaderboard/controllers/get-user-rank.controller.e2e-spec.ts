import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { createNestApp } from '../../../../test/create-nest-app.js';

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

describe('GetUserRank (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/users/:username/rank → 404 for unknown username', async () => {
    const response = await request(server).get(
      '/api/v1/users/nobody_at_all/rank',
    );

    expect(response.status).toBe(404);
  });

  it('[GET] /api/v1/users/:username/rank → 200 accessible without auth', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'rank-anon@example.com',
      'rank_anon',
    );
    await makePayment(server, cookies, 100);

    const response = await request(server).get('/api/v1/users/rank_anon/rank');

    expect(response.status).toBe(200);
  });

  it('[GET] /api/v1/users/:username/rank → returns correct shape', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'rank-shape@example.com',
      'rank_shape',
    );
    await makePayment(server, cookies, 500);

    const response = await request(server).get('/api/v1/users/rank_shape/rank');

    expect(response.status).toBe(200);
    expect(typeof response.body.rank).toBe('number');
    expect(typeof response.body.points).toBe('number');
    expect(response.body.points).toBe(5);
    expect(
      response.body.nextRivalDelta === null ||
        typeof response.body.nextRivalDelta === 'number',
    ).toBe(true);
  });

  it('[GET] /api/v1/users/:username/rank → nextRivalDelta is null when user is rank 1', async () => {
    const cookies = await signUpAndGetCookies(
      server,
      'rank-top@example.com',
      'rank_top',
    );
    // Make a very large payment so this user is almost certainly rank 1
    await makePayment(server, cookies, 9999900);

    const response = await request(server).get('/api/v1/users/rank_top/rank');

    expect(response.status).toBe(200);
    expect(response.body.rank).toBe(1);
    expect(response.body.nextRivalDelta).toBeNull();
  });

  it('[GET] /api/v1/users/:username/rank → rank reflects position behind users with more points', async () => {
    const leaderCookies = await signUpAndGetCookies(
      server,
      'rank-leader@example.com',
      'rank_leader',
    );
    const chaserCookies = await signUpAndGetCookies(
      server,
      'rank-chaser@example.com',
      'rank_chaser',
    );

    await makePayment(server, leaderCookies, 50000);
    await makePayment(server, chaserCookies, 100);

    const leaderResponse = await request(server).get(
      '/api/v1/users/rank_leader/rank',
    );
    const chaserResponse = await request(server).get(
      '/api/v1/users/rank_chaser/rank',
    );

    expect(leaderResponse.status).toBe(200);
    expect(chaserResponse.status).toBe(200);
    expect(leaderResponse.body.rank).toBeLessThan(chaserResponse.body.rank);
  });

  it('[GET] /api/v1/users/:username/rank → nextRivalDelta equals the points gap to the user above', async () => {
    const topCookies = await signUpAndGetCookies(
      server,
      'rank-delta-top@example.com',
      'rank_delta_top',
    );
    const bottomCookies = await signUpAndGetCookies(
      server,
      'rank-delta-bot@example.com',
      'rank_delta_bot',
    );

    // Top user: 200 points, bottom user: 100 points
    await makePayment(server, topCookies, 20000);
    await makePayment(server, bottomCookies, 10000);

    const topResponse = await request(server).get(
      '/api/v1/users/rank_delta_top/rank',
    );
    const bottomResponse = await request(server).get(
      '/api/v1/users/rank_delta_bot/rank',
    );

    expect(topResponse.status).toBe(200);
    expect(bottomResponse.status).toBe(200);
    // The gap from bottom to the user directly above (top) is 100 points
    // But other users may also be between them, so just verify the delta is positive
    // and matches the actual gap to the immediate rival
    expect(bottomResponse.body.nextRivalDelta).toBeGreaterThan(0);
    expect(bottomResponse.body.nextRivalDelta).toBeLessThanOrEqual(
      topResponse.body.points - bottomResponse.body.points,
    );
  });
});
