import { OutboxRepository } from '../repositories/outbox.repository.js';
import { publish } from '@football-oracle/kafka';

export interface OutboxRelayConfig {
  intervalMs: number;
  batchSize: number;
  maxRetries: number;
}

export class OutboxRelay {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;

  constructor(
    readonly repository: OutboxRepository,
    readonly config: OutboxRelayConfig,
  ) {}

  /**
   * Start the relay job
   */
  start(): void {
    if (this.timer) return;
    console.log(`[OutboxRelay] Starting job with interval ${this.config.intervalMs}ms`);
    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.config.intervalMs);
  }

  /**
   * Stop the relay job
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('[OutboxRelay] Job stopped');
  }

  /**
   * Run a single iteration of the relay
   */
  async runOnce(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEvents = await this.repository.fetchPendingEvents(
        this.config.batchSize,
        this.config.maxRetries,
      );

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[OutboxRelay] Processing ${pendingEvents.length} events...`);

      // Process in parallel but handle errors individually
      await Promise.allSettled(
        pendingEvents.map(async (event) => {
          try {
            await publish(event.topic, event.payload as object);
            await this.repository.markAsProcessed(event.id);
          } catch (error) {
            console.error(`[OutboxRelay] Error publishing event ${event.id}:`, error);
            await this.repository.incrementRetries(event.id, this.config.maxRetries);
          }
        }),
      );
    } catch (error) {
      console.error('[OutboxRelay] Critical error in relay loop:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
