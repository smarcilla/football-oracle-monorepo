import { MatchRepository, MatchFilters, BulkMatchInput } from '../repositories/match.repository.js';

export class MatchService {
  private repository: MatchRepository;

  constructor() {
    this.repository = new MatchRepository();
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
}
