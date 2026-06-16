import { GetReadinessService } from './get-readiness.service.js';
import { FakeEnvService } from '#test/env/fake-env.service.js';

describe('GetReadinessService', () => {
  let fakeEnvService: FakeEnvService;
  let getReadinessService: GetReadinessService;

  beforeEach(() => {
    fakeEnvService = new FakeEnvService();
    getReadinessService = new GetReadinessService(fakeEnvService);
  });

  it('should return status as ok', () => {
    const result = getReadinessService.execute();
    expect(result.status).toBe('ok');
  });

  it('should return service name from env', () => {
    fakeEnvService.set('APP_NAME', 'my-service');
    const result = getReadinessService.execute();
    expect(result.service).toBe('my-service');
  });

  it('should return version from env', () => {
    fakeEnvService.set('APP_VERSION', '2.0.0');
    const result = getReadinessService.execute();
    expect(result.version).toBe('2.0.0');
  });

  it('should return environment from env', () => {
    fakeEnvService.set('NODE_ENV', 'production');
    const result = getReadinessService.execute();
    expect(result.environment).toBe('production');
  });

  it('should return numeric uptime', () => {
    const result = getReadinessService.execute();
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return ISO timestamp', () => {
    const result = getReadinessService.execute();
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('should return app check as ok', () => {
    const result = getReadinessService.execute();
    expect(result.checks.app).toBe('ok');
  });

  it('should return correct response structure with checks', () => {
    const result = getReadinessService.execute();
    expect(result).toEqual({
      status: 'ok',
      service: 'test-app',
      version: '1.0.0',
      environment: 'test',
      uptime: expect.any(Number),
      timestamp: expect.any(String),
      checks: {
        app: 'ok',
      },
    });
  });
});
