import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { achievementDefinitions } from '#domain/achievements/data/achievement-definitions.js';
import { createNestApp } from '../../../../test/create-nest-app.js';

describe('GetAchievements (E2E)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createNestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('[GET] /api/v1/achievements → 200 with all definitions (no auth required)', async () => {
    const response = await request(server).get('/api/v1/achievements');

    expect(response.status).toBe(200);
    expect(response.body.achievements).toHaveLength(
      achievementDefinitions.length,
    );
    expect(response.body.achievements[0]).toEqual(achievementDefinitions[0]);
  });
});
