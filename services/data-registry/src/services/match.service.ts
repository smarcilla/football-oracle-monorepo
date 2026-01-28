import { MatchRepository, MatchFilters, BulkMatchInput } from '../repositories/match.repository.js';
import {
  SimulationRepository,
  CreateSimulationInput,
} from '../repositories/simulation.repository.js';
import { ReportRepository, CreateReportInput } from '../repositories/report.repository.js';
import { MatchStatus } from '@prisma/client';

export class MatchService {
  private repository: MatchRepository;
  private simulationRepository: SimulationRepository;
  private reportRepository: ReportRepository;

  constructor() {
    this.repository = new MatchRepository();
    this.simulationRepository = new SimulationRepository();
    this.reportRepository = new ReportRepository();
  }

  async getMatches(filters: MatchFilters) {
    // TODO: Add Redis cache layer in the future
    return this.repository.findAll(filters);
  }

  async getMatchById(id: number) {
    // TODO: Add Redis cache layer in the future
    return this.repository.findById(id);
  }

  async bulkCreateMatches(leagueId: string, seasonName: string, matches: BulkMatchInput[]) {
    return this.repository.bulkCreate(leagueId, seasonName, matches);
  }

  async updateMatchStatus(id: number, newStatus: MatchStatus) {
    const match = await this.repository.findById(id);
    if (!match) throw new Error('Match not found');

    this.validateStatusTransition(match.status, newStatus);

    return this.repository.updateStatus(id, newStatus);
  }

  async updateMatchData(id: number, rawShots: unknown) {
    const match = await this.repository.findById(id);
    if (!match) throw new Error('Match not found');

    // Transitions to SCRAPED
    this.validateStatusTransition(match.status, MatchStatus.SCRAPED);

    return this.repository.updateData(id, rawShots);
  }

  async createSimulation(input: CreateSimulationInput) {
    const match = await this.repository.findById(input.matchId);
    if (!match) throw new Error('Match not found');

    this.validateStatusTransition(match.status, MatchStatus.SIMULATED);

    return this.simulationRepository.create(input);
  }

  async createReport(input: CreateReportInput) {
    const match = await this.repository.findById(input.matchId);
    if (!match) throw new Error('Match not found');

    this.validateStatusTransition(match.status, MatchStatus.COMPLETED);

    return this.reportRepository.create(input);
  }

  private validateStatusTransition(current: MatchStatus, next: MatchStatus) {
    const allowed: Record<MatchStatus, MatchStatus[]> = {
      IDENTIFIED: [MatchStatus.SCRAPING, MatchStatus.FAILED],
      SCRAPING: [MatchStatus.SCRAPED, MatchStatus.FAILED],
      SCRAPED: [MatchStatus.SIMULATING, MatchStatus.FAILED],
      SIMULATING: [MatchStatus.SIMULATED, MatchStatus.FAILED],
      SIMULATED: [MatchStatus.REPORTING, MatchStatus.FAILED],
      REPORTING: [MatchStatus.COMPLETED, MatchStatus.FAILED],
      COMPLETED: [],
      FAILED: [MatchStatus.IDENTIFIED, MatchStatus.SCRAPING], // Allow retry
    };

    const allowedTransitions = allowed[current];
    if (allowedTransitions && !allowedTransitions.includes(next)) {
      // If it's a "finalizing" status, we also allow jumping from the "ING" state's previous state
      if (next === MatchStatus.SCRAPED && current === MatchStatus.IDENTIFIED) return;
      if (next === MatchStatus.SIMULATED && current === MatchStatus.SCRAPED) return;
      if (next === MatchStatus.COMPLETED && current === MatchStatus.SIMULATED) return;

      throw new Error(`Invalid status transition from ${current} to ${next}`);
    }
  }
}
