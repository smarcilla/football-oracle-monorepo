import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutboxRepository } from './outbox.repository.js';
import { prisma } from '../config/db.js';
import { OutboxStatus } from '@prisma/client';

// Mock Prisma
vi.mock('../config/db.js', () => ({
  prisma: {
    outbox: {
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('OutboxRepository', () => {
  let repository: OutboxRepository;

  beforeEach(() => {
    repository = new OutboxRepository();
    vi.clearAllMocks();
  });

  it('fetchPendingEvents should call findMany with correct filters', async () => {
    const mockEvents = [{ id: '1' }] as any;
    vi.mocked(prisma.outbox.findMany).mockResolvedValue(mockEvents);

    const result = await repository.fetchPendingEvents(10, 5);

    expect(result).toEqual(mockEvents);
    expect(prisma.outbox.findMany).toHaveBeenCalledWith({
      where: {
        status: OutboxStatus.PENDING,
        retries: { lt: 5 },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  });

  it('markAsProcessed should update status and processedAt', async () => {
    await repository.markAsProcessed('123');

    expect(prisma.outbox.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: expect.objectContaining({
        status: OutboxStatus.PROCESSED,
        processedAt: expect.any(Date),
      }),
    });
  });

  it('incrementRetries should increase retries and keep PENDING if below max', async () => {
    vi.mocked(prisma.outbox.findUnique).mockResolvedValue({ id: '1', retries: 2 } as any);

    await repository.incrementRetries('1', 5);

    expect(prisma.outbox.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        retries: 3,
        status: OutboxStatus.PENDING,
      },
    });
  });

  it('incrementRetries should mark as FAILED if max retries reached', async () => {
    vi.mocked(prisma.outbox.findUnique).mockResolvedValue({ id: '1', retries: 4 } as any);

    await repository.incrementRetries('1', 5);

    expect(prisma.outbox.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: {
        retries: 5,
        status: OutboxStatus.FAILED,
      },
    });
  });

  it('incrementRetries should do nothing if event not found', async () => {
    vi.mocked(prisma.outbox.findUnique).mockResolvedValue(null);

    await repository.incrementRetries('invalid', 5);

    expect(prisma.outbox.update).not.toHaveBeenCalled();
  });
});
