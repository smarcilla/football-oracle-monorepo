import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './index.js';

// Mock the repositories
vi.mock('./repositories/match.repository.js', () => ({
  MatchRepository: class {
    findAll = vi.fn().mockResolvedValue([{ id: 1, team: 'Team A vs Team B', status: 'COMPLETED' }]);
    findById = vi.fn().mockImplementation((id: number) => {
      if (id === 1) {
        return Promise.resolve({ id: 1, team: 'Team A vs Team B', status: 'IDENTIFIED' });
      }
      if (id === 101) {
        return Promise.resolve({ id: 101, team: 'Team A vs Team B', status: 'SCRAPED' });
      }
      if (id === 102) {
        return Promise.resolve({ id: 102, team: 'Team A vs Team B', status: 'SIMULATED' });
      }
      return Promise.resolve(null);
    });
    bulkCreate = vi.fn().mockResolvedValue([{ id: 101 }, { id: 102 }]);
    updateStatus = vi.fn().mockResolvedValue({ id: 1, status: 'SCRAPING' });
    updateData = vi.fn().mockResolvedValue({ id: 1, status: 'SCRAPED' });
  },
}));

vi.mock('./repositories/simulation.repository.js', () => ({
  SimulationRepository: class {
    create = vi.fn().mockResolvedValue({ id: 1, matchId: 101 });
  },
}));

vi.mock('./repositories/report.repository.js', () => ({
  ReportRepository: class {
    create = vi.fn().mockResolvedValue({ id: 1, matchId: 102 });
  },
}));

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

  describe('Lifecycle Endpoints', () => {
    it('PATCH /matches/:id/status should update status', async () => {
      const response = await request(app)
        .patch('/matches/1/status')
        .set('x-api-key', 'test-secret-key')
        .send({ status: 'SCRAPING' });

      expect(response.status).toBe(200);
      expect((response.body as { data: { status: string } }).data.status).toBe('SCRAPING');
    });

    it('PATCH /matches/:id/data should update shots data', async () => {
      const response = await request(app)
        .patch('/matches/1/data')
        .set('x-api-key', 'test-secret-key')
        .send({ rawShots: [{ x: 1, y: 2 }] });

      expect(response.status).toBe(200);
      expect((response.body as { data: { status: string } }).data.status).toBe('SCRAPED');
    });

    it('POST /simulations should create a simulation result', async () => {
      const response = await request(app)
        .post('/simulations')
        .set('x-api-key', 'test-secret-key')
        .send({
          matchId: 101,
          results: { homeWinProb: 0.5, drawProb: 0.3, awayWinProb: 0.2, iterations: 1000 },
        });

      expect(response.status).toBe(201);
      expect((response.body as { data: { matchId: number } }).data.matchId).toBe(101);
    });

    it('POST /reports should create an AI report', async () => {
      const response = await request(app)
        .post('/reports')
        .set('x-api-key', 'test-secret-key')
        .send({
          matchId: 102,
          content: 'Long enough content for validation',
          provider: 'openai',
        });

      expect(response.status).toBe(201);
      expect((response.body as { data: { matchId: number } }).data.matchId).toBe(102);
    });
  });
});
