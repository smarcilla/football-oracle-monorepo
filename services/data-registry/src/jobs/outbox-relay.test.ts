import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OutboxRelay } from './outbox-relay.js';
import { OutboxRepository } from '../repositories/outbox.repository.js';
import { publish } from '@football-oracle/kafka';

// Mock Kafka publish
vi.mock('@football-oracle/kafka', () => ({
  publish: vi.fn(),
}));

describe('OutboxRelay', () => {
  let repository: OutboxRepository;
  let relay: OutboxRelay;
  const config = {
    intervalMs: 100,
    batchSize: 10,
    maxRetries: 3,
  };

  beforeEach(() => {
    repository = {
      fetchPendingEvents: vi.fn(),
      markAsProcessed: vi.fn(),
      incrementRetries: vi.fn(),
    } as any;

    relay = new OutboxRelay(repository, config);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should process pending events successfully', async () => {
    const mockEvents = [
      { id: '1', topic: 'test-topic', payload: { data: 'event1' } },
      { id: '2', topic: 'test-topic', payload: { data: 'event2' } },
    ] as any;

    vi.mocked(repository.fetchPendingEvents).mockResolvedValue(mockEvents);
    vi.mocked(publish).mockResolvedValue(undefined);

    await relay.runOnce();

    expect(repository.fetchPendingEvents).toHaveBeenCalledWith(config.batchSize, config.maxRetries);
    expect(publish).toHaveBeenCalledTimes(2);
    expect(repository.markAsProcessed).toHaveBeenCalledWith('1');
    expect(repository.markAsProcessed).toHaveBeenCalledWith('2');
  });

  it('should handle partial failures and increment retries', async () => {
    const mockEvents = [
      { id: 'good', topic: 'topic', payload: {} },
      { id: 'bad', topic: 'topic', payload: {} },
    ] as any;

    vi.mocked(repository.fetchPendingEvents).mockResolvedValue(mockEvents);

    // First publish succeeds, second fails
    vi.mocked(publish)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Kafka error'));

    await relay.runOnce();

    expect(repository.markAsProcessed).toHaveBeenCalledWith('good');
    expect(repository.incrementRetries).toHaveBeenCalledWith('bad', config.maxRetries);
  });

  it('should not process if already processing', async () => {
    // We use a promise that we resolve manually to simulate a long running task
    let resolvePending: (value: any[]) => void;
    const pendingPromise = new Promise<any[]>((res) => {
      resolvePending = res;
    });

    vi.mocked(repository.fetchPendingEvents).mockReturnValue(pendingPromise);

    const promise1 = relay.runOnce();
    const promise2 = relay.runOnce();

    // Resolve the first one
    resolvePending!([]);
    await promise1;
    await promise2;

    expect(repository.fetchPendingEvents).toHaveBeenCalledTimes(1);
  });

  it('should handle repository errors gracefully', async () => {
    vi.mocked(repository.fetchPendingEvents).mockRejectedValue(new Error('DB Error'));

    // Should not throw
    await expect(relay.runOnce()).resolves.toBeUndefined();
  });

  it('should start and stop timer', () => {
    relay.start();
    expect(vi.getTimerCount()).toBe(1);

    relay.stop();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should call runOnce on interval', async () => {
    const runOnceSpy = vi.spyOn(relay, 'runOnce').mockResolvedValue(undefined);

    relay.start();

    await vi.advanceTimersByTimeAsync(config.intervalMs);
    expect(runOnceSpy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(config.intervalMs);
    expect(runOnceSpy).toHaveBeenCalledTimes(2);

    relay.stop();
  });
});
