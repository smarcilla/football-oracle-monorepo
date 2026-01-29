import { prisma } from '../config/db.js';
import { BusinessTopic } from '@football-oracle/types';
import { Prisma, MatchStatus, OutboxStatus } from '@prisma/client';

export interface CreateReportInput {
  matchId: number;
  content: string;
}

export class ReportRepository {
  async create(input: CreateReportInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const report = await tx.report.upsert({
        where: { matchId: input.matchId },
        update: { content: input.content },
        create: {
          matchId: input.matchId,
          content: input.content,
        },
      });

      await tx.match.update({
        where: { id: input.matchId },
        data: { status: MatchStatus.COMPLETED },
      });

      await tx.outbox.create({
        data: {
          topic: BusinessTopic.MATCH_REPORT_GENERATED,
          payload: {
            matchId: input.matchId,
            reportId: report.id,
          },
          status: OutboxStatus.PENDING,
        },
      });

      return report;
    });
  }
}
