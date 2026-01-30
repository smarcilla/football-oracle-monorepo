import { prisma } from '../config/db.js';
import { Prisma, Match, MatchStatus, OutboxStatus } from '@prisma/client';
import { BusinessTopic } from '@football-oracle/types';

export interface MatchFilters {
  leagueId?: string;
  seasonId?: number;
  status?: MatchStatus;
}

export interface BulkMatchInput {
  id: number;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
}

export class MatchRepository {
  async findAll(filters: MatchFilters): Promise<Match[]> {
    return prisma.match.findMany({
      where: {
        season: {
          leagueId: filters.leagueId,
        },
        seasonId: filters.seasonId,
        status: filters.status,
      },
      include: {
        season: {
          include: {
            league: true,
          },
        },
        simulation: true,
        report: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findById(id: number): Promise<Match | null> {
    return prisma.match.findUnique({
      where: { id },
      include: {
        season: {
          include: {
            league: true,
          },
        },
        simulation: true,
        report: true,
      },
    });
  }

  async updateStatus(id: number, status: MatchStatus) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const match = await tx.match.update({
        where: { id },
        data: { status },
      });

      // No specific business event for just status change usually,
      // but maybe we want one if it's a specific transition.
      // For now, let's keep it simple.

      return match;
    });
  }

  async updateData(id: number, rawShots: unknown) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const match = await tx.match.update({
        where: { id },
        data: {
          rawShots: rawShots as Prisma.InputJsonValue,
          status: MatchStatus.SCRAPED,
          scrapedAt: new Date(),
        },
      });

      await tx.outbox.create({
        data: {
          topic: BusinessTopic.MATCH_DATA_SCRAPED,
          payload: {
            matchId: match.id,
            shotsCount: Array.isArray(rawShots) ? rawShots.length : 0,
          },
          status: OutboxStatus.PENDING,
        },
      });

      return match;
    });
  }

  async bulkCreate(leagueId: string, seasonName: string, matches: BulkMatchInput[]) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Get or create season
      let season = await tx.season.findFirst({
        where: { leagueId, name: seasonName },
      });

      // refactor to use nullish coalescing operator

      season ??= await tx.season.create({
        data: { leagueId, name: seasonName },
      });

      const results = [];
      for (const m of matches) {
        const match = await tx.match.upsert({
          where: { id: m.id },
          update: {
            date: new Date(m.date),
          },
          create: {
            id: m.id,
            date: new Date(m.date),
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            seasonId: season.id,
            status: MatchStatus.IDENTIFIED,
          },
        });

        results.push(match);
      }

      // 3. Single Outbox entry for the whole sync
      await tx.outbox.create({
        data: {
          topic: BusinessTopic.LEAGUE_SYNCED,
          payload: {
            league: leagueId,
            year: seasonName,
            matchesCount: results.length,
          },
          status: OutboxStatus.PENDING,
        },
      });

      return results;
    });
  }
}
