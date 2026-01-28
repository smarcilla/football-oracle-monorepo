import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './index.js';

// Mock the repository to avoid DB connection issues
vi.mock('./repositories/match.repository.js', () => {
  return {
    MatchRepository: class {
      findAll = vi.fn().mockResolvedValue([]);
      findById = vi.fn();
    },
  };
});

describe('Data Registry - Security Integration', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-secret-key');
  });

  it('should return 401 if x-api-key is missing', async () => {
    const response = await request(app).get('/matches');
    expect(response.status).toBe(401);
    const body = response.body as { message: string };
    expect(body.message).toContain('Unauthorized');
  });

  it('should return 401 if x-api-key is incorrect', async () => {
    const response = await request(app).get('/matches').set('x-api-key', 'wrong-key');
    expect(response.status).toBe(401);
  });

  it('should return 200 if x-api-key is correct', async () => {
    const response = await request(app).get('/matches').set('x-api-key', 'test-secret-key');
    expect(response.status).toBe(200);
  });

  it('should allow access to /health without API Key', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    const body = response.body as { status: string };
    expect(body.status).toBe('ok');
  });
});
