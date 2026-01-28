import { prisma } from '../config/db.js';
import { BusinessTopic } from '@football-oracle/types';
import { Prisma, MatchStatus, OutboxStatus } from '@prisma/client';

export interface SimulationResults {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  iterations: number;
}

export interface CreateSimulationInput {
  matchId: number;
  results: SimulationResults;
}

export class SimulationRepository {
  async create(input: CreateSimulationInput) {
    return prisma.$transaction(async (tx) => {
      const simulation = await tx.simulation.upsert({
        where: { matchId: input.matchId },
        update: { results: input.results as unknown as Prisma.InputJsonValue },
        create: {
          matchId: input.matchId,
          results: input.results as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.match.update({
        where: { id: input.matchId },
        data: { status: MatchStatus.SIMULATED },
      });

      // Determine winner prob for the event payload
      const { results } = input;
      let winnerProb: 'home' | 'draw' | 'away' = 'draw';
      if (results.homeWinProb > results.awayWinProb && results.homeWinProb > results.drawProb) {
        winnerProb = 'home';
      } else if (
        results.awayWinProb > results.homeWinProb &&
        results.awayWinProb > results.drawProb
      ) {
        winnerProb = 'away';
      }

      await tx.outbox.create({
        data: {
          topic: BusinessTopic.MATCH_SIMULATION_COMPLETED,
          payload: {
            matchId: input.matchId,
            winnerProb,
          },
          status: OutboxStatus.PENDING,
        },
      });

      return simulation;
    });
  }
}
