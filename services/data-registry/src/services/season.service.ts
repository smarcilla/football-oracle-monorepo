import { SeasonRepository } from '../repositories/season.repository.js';
import { Season } from '@prisma/client';

export class SeasonService {
  private readonly repository: SeasonRepository;

  constructor(repository?: SeasonRepository) {
    this.repository = repository || new SeasonRepository();
  }

  async getSeasonByLeagueAndYear(leagueId: string, year: string): Promise<Season | null> {
    return this.repository.findByLeagueAndYear(leagueId, year);
  }

  async requestSync(seasonId: number): Promise<void> {
    await this.repository.requestSync(seasonId);
  }
}
