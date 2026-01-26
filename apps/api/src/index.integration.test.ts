import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './index.js';
import * as kafka from '@football-oracle/kafka';

// Mock the Kafka package
vi.mock('@football-oracle/kafka', () => ({
  initKafka: vi.fn().mockResolvedValue(undefined),
  publish: vi.fn().mockResolvedValue(undefined),
  subscribe: vi.fn().mockResolvedValue(undefined),
  disconnectKafka: vi.fn().mockResolvedValue(undefined),
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health should return 200 ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('POST /analyze should publish a message to Kafka and return 200', async () => {
    const response = await request(app).post('/analyze/123');

    expect(response.status).toBe(200);
    const body = response.body as { status: string };
    expect(body.status).toBe('accepted');

    // Check if kafka.publish was called with correct parameters
    expect(kafka.publish).toHaveBeenCalledWith(
      'match.analysis_requested',
      expect.objectContaining({
        matchId: '123',
      }),
    );
  });
});
