import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchService } from './match.service.js';
import { MatchStatus } from '@prisma/client';

describe('MatchService', () => {
  let service: MatchService;
  let mockMatchRepo: any;
  let mockSimRepo: any;
  let mockReportRepo: any;

  beforeEach(() => {
    mockMatchRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      bulkCreate: vi.fn(),
      updateStatus: vi.fn(),
      updateData: vi.fn(),
    };
    mockSimRepo = {
      create: vi.fn(),
    };
    mockReportRepo = {
      create: vi.fn(),
    };

    service = new MatchService(mockMatchRepo, mockSimRepo, mockReportRepo);
  });

  describe('getMatches', () => {
    it('should call repository.findAll', async () => {
      await service.getMatches({ leagueId: 'test' });
      expect(mockMatchRepo.findAll).toHaveBeenCalledWith({ leagueId: 'test' });
    });
  });

  describe('updateMatchStatus', () => {
    it('should update status if transition is valid', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.IDENTIFIED });

      await service.updateMatchStatus(1, MatchStatus.SCRAPING);

      expect(mockMatchRepo.updateStatus).toHaveBeenCalledWith(1, MatchStatus.SCRAPING);
    });

    it('should throw error if match not found', async () => {
      mockMatchRepo.findById.mockResolvedValue(null);

      await expect(service.updateMatchStatus(1, MatchStatus.SCRAPING)).rejects.toThrow(
        'Match not found',
      );
    });

    it('should throw error if transition is invalid', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.IDENTIFIED });

      await expect(service.updateMatchStatus(1, MatchStatus.SIMULATED)).rejects.toThrow(
        'Invalid status transition from IDENTIFIED to SIMULATED',
      );
    });

    it('should allow valid shortcut transitions (IDENTIFIED -> SCRAPED)', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.IDENTIFIED });

      await service.updateMatchStatus(1, MatchStatus.SCRAPED);

      expect(mockMatchRepo.updateStatus).toHaveBeenCalledWith(1, MatchStatus.SCRAPED);
    });
  });

  describe('createSimulation', () => {
    it('should create simulation and update status', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.SCRAPED });
      const input = { matchId: 1, results: {} };

      await service.createSimulation(input as any);

      expect(mockSimRepo.create).toHaveBeenCalledWith(input);
    });
  });

  describe('bulkCreateMatches', () => {
    it('should call repository.bulkCreate', async () => {
      const matches = [{ id: 1, date: '2023-01-01', homeTeamId: 1, awayTeamId: 2 }];
      await service.bulkCreateMatches('L1', 'S1', matches);
      expect(mockMatchRepo.bulkCreate).toHaveBeenCalledWith('L1', 'S1', matches);
    });
  });

  describe('updateMatchData', () => {
    it('should update shots and transition to SCRAPED', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.SCRAPING });
      const shots = { data: [] };

      await service.updateMatchData(1, shots);

      expect(mockMatchRepo.updateData).toHaveBeenCalledWith(1, shots);
    });
  });

  describe('createReport', () => {
    it('should create report and transition to COMPLETED', async () => {
      mockMatchRepo.findById.mockResolvedValue({ id: 1, status: MatchStatus.SIMULATED });
      const input = { matchId: 1, content: 'report' };

      await service.createReport(input as any);

      expect(mockReportRepo.create).toHaveBeenCalledWith(input);
    });
  });
});
