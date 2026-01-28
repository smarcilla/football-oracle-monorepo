import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './index.js';

// Mock the repository
vi.mock('./repositories/match.repository.js', () => {
  return {
    MatchRepository: class {
      findAll = vi
        .fn()
        .mockResolvedValue([{ id: 1, team: 'Team A vs Team B', status: 'COMPLETED' }]);
      findById = vi.fn().mockImplementation((id: number) => {
        if (id === 1) {
          return Promise.resolve({ id: 1, team: 'Team A vs Team B', status: 'COMPLETED' });
        }
        return Promise.resolve(null);
      });
      bulkCreate = vi.fn().mockResolvedValue([{ id: 101 }, { id: 102 }]);
    },
  };
});

describe('Data Registry - Matches Endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-secret-key');
  });

  it('GET /matches should return matches when authenticated', async () => {
    const response = await request(app).get('/matches').set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(200);
    const body = response.body as { status: string; data: { id: number }[] };
    expect(body.status).toBe('success');
    expect(body.data).toHaveLength(1);
    expect(body.data[0]!.id).toBe(1);
  });

  it('GET /matches should filter by status', async () => {
    const response = await request(app)
      .get('/matches?status=COMPLETED')
      .set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(200);
  });

  it('GET /matches should return 400 for invalid status', async () => {
    const response = await request(app)
      .get('/matches?status=INVALID_STATUS')
      .set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(400);
    const body = response.body as { message: string };
    expect(body.message).toContain('Invalid query parameters');
  });

  it('GET /matches/:id should return match details', async () => {
    const response = await request(app).get('/matches/1').set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(200);
    const body = response.body as { data: { id: number } };
    expect(body.data.id).toBe(1);
  });

  it('GET /matches/:id should return 404 if not found', async () => {
    const response = await request(app).get('/matches/999').set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(404);
  });

  it('GET /matches/:id should return 400 for non-numeric ID', async () => {
    const response = await request(app).get('/matches/abc').set('x-api-key', 'test-secret-key');

    expect(response.status).toBe(400);
  });

  it('POST /matches/bulk should create matches', async () => {
    const response = await request(app)
      .post('/matches/bulk')
      .set('x-api-key', 'test-secret-key')
      .send({
        leagueId: 'PL',
        seasonName: '2023-24',
        matches: [
          { id: 101, date: new Date().toISOString(), homeTeamId: 1, awayTeamId: 2 },
          { id: 102, date: new Date().toISOString(), homeTeamId: 3, awayTeamId: 4 },
        ],
      });

    expect(response.status).toBe(201);
    const body = response.body as { data: { count: number } };
    expect(body.data.count).toBe(2);
  });

  it('POST /matches/bulk should return 400 for invalid body', async () => {
    const response = await request(app)
      .post('/matches/bulk')
      .set('x-api-key', 'test-secret-key')
      .send({
        leagueId: 'PL',
        // missing seasonName and matches
      });

    expect(response.status).toBe(400);
  });
});
