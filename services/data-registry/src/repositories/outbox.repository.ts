import { prisma } from '../config/db.js';
import { Outbox, OutboxStatus } from '@prisma/client';

export class OutboxRepository {
  /**
   * Fetch pending events that haven't exceeded max retries
   */
  async fetchPendingEvents(limit: number, maxRetries: number): Promise<Outbox[]> {
    return prisma.outbox.findMany({
      where: {
        status: OutboxStatus.PENDING,
        retries: {
          lt: maxRetries,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });
  }

  /**
   * Mark an event as processed
   */
  async markAsProcessed(id: string): Promise<void> {
    await prisma.outbox.update({
      where: { id },
      data: {
        status: OutboxStatus.PROCESSED,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Increment retry count and mark as failed if it reaches max retries
   */
  async incrementRetries(id: string, maxRetries: number): Promise<void> {
    const outbox = await prisma.outbox.findUnique({
      where: { id },
      select: { retries: true },
    });

    if (!outbox) return;

    const newRetries = outbox.retries + 1;
    const newStatus = newRetries >= maxRetries ? OutboxStatus.FAILED : OutboxStatus.PENDING;

    await prisma.outbox.update({
      where: { id },
      data: {
        retries: newRetries,
        status: newStatus,
      },
    });
  }
}
