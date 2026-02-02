import { prisma } from '../config/db.js';
import { Season, OutboxStatus } from '@prisma/client';
import { BusinessTopic, LeagueSyncRequested } from '@football-oracle/types';

export class SeasonRepository {
  async findByLeagueAndYear(leagueId: string, year: string): Promise<Season | null> {
    return prisma.season.findUnique({
      where: {
        leagueId_name: {
          leagueId,
          name: year,
        },
      },
    });
  }

  async findById(id: number): Promise<Season | null> {
    return prisma.season.findUnique({
      where: { id },
    });
  }

  async requestSync(seasonId: number): Promise<void> {
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
      include: { league: true },
    });

    if (!season) {
      throw new Error(`Season with ID ${seasonId} not found`);
    }

    const payload: LeagueSyncRequested = {
      leagueId: season.leagueId,
      year: season.name,
    };

    await prisma.outbox.create({
      data: {
        topic: BusinessTopic.LEAGUE_SYNC_REQUESTED,
        payload: payload as any,
        status: OutboxStatus.PENDING,
      },
    });
  }
}
