import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchHandler } from './match.handler.js';
import { MatchStatus } from '@prisma/client';

describe('MatchHandler', () => {
  let handler: MatchHandler;
  let mockService: any;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockService = {
      getMatches: vi.fn(),
      getMatchById: vi.fn(),
      bulkCreateMatches: vi.fn(),
      updateMatchStatus: vi.fn(),
      updateMatchData: vi.fn(),
      createSimulation: vi.fn(),
      createReport: vi.fn(),
    };
    handler = new MatchHandler(mockService);

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getMatches', () => {
    it('should return 200 and matches on success', async () => {
      mockReq = { query: {} };
      mockService.getMatches.mockResolvedValue([]);

      await handler.getMatches(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: [],
      });
    });

    it('should return 400 for invalid query', async () => {
      mockReq = { query: { status: 'INVALID' } };

      await handler.getMatches(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateMatchStatus', () => {
    it('should return 200 on success', async () => {
      mockReq = {
        params: { id: '1' },
        body: { status: MatchStatus.SCRAPING },
      };
      mockService.updateMatchStatus.mockResolvedValue({ id: 1, status: MatchStatus.SCRAPING });

      await handler.updateMatchStatus(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { id: 1, status: MatchStatus.SCRAPING },
      });
    });

    it('should return 400 if service throws', async () => {
      mockReq = {
        params: { id: '1' },
        body: { status: MatchStatus.SCRAPING },
      };
      mockService.updateMatchStatus.mockRejectedValue(new Error('Match not found'));

      await handler.updateMatchStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Match not found',
      });
    });
  });

  describe('bulkCreateMatches', () => {
    it('should return 201 on success', async () => {
      mockReq = {
        body: { leagueId: 'L1', seasonName: 'S1', matches: [] },
      };
      mockService.bulkCreateMatches.mockResolvedValue([]);

      await handler.bulkCreateMatches(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
