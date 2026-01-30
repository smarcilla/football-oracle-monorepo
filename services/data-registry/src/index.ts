import express, { Express } from 'express';
import { apiKeyMiddleware } from './middleware/auth.js';
import {
  getMatches,
  getMatchById,
  bulkCreateMatches,
  updateMatchStatus,
  updateMatchData,
  createSimulation,
  createReport,
} from './handlers/match.handler.js';
import { initKafka } from '@football-oracle/kafka';
import { OutboxRelay } from './jobs/outbox-relay.js';
import { OutboxRepository } from './repositories/outbox.repository.js';

const app: Express = express();
app.disable('x-powered-by');

app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Apply API Key protection
app.use(apiKeyMiddleware);

// Routes
app.get('/matches', getMatches);
app.get('/matches/:id', getMatchById);
app.post('/matches/bulk', bulkCreateMatches);
app.patch('/matches/:id/status', updateMatchStatus);
app.patch('/matches/:id/data', updateMatchData);
app.post('/simulations', createSimulation);
app.post('/reports', createReport);

// Global Error Handler
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Data Registry Error]:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal Server Error',
    });
  },
);

const PORT = process.env['PORT'] || 3002;

if (process.env['NODE_ENV'] !== 'test') {
  // Initialize Kafka
  const kafkaBrokers = process.env['KAFKA_BROKERS'] || 'localhost:9092';

  // refactor conde to use top-level await

  try {
    await initKafka({
      clientId: process.env['KAFKA_CLIENT_ID'] || 'data-registry',
      brokers: kafkaBrokers.split(','),
      groupId: process.env['KAFKA_GROUP_ID'] || 'data-registry-group',
    });
  } catch (err) {
    console.error('[Data Registry] Failed to initialize Kafka:', err);
  }

  // Start the server

  app.listen(PORT, () => {
    console.log(`[Data Registry] Server running on port ${PORT}`);

    // Initialize and start Outbox Relay
    const relayConfig = {
      intervalMs: Number.parseInt(process.env['OUTBOX_RELAY_INTERVAL_MS'] || '1000', 10),
      batchSize: Number.parseInt(process.env['OUTBOX_RELAY_BATCH_SIZE'] || '20', 10),
      maxRetries: Number.parseInt(process.env['OUTBOX_RELAY_MAX_RETRIES'] || '5', 10),
    };

    const outboxRepository = new OutboxRepository();
    const relay = new OutboxRelay(outboxRepository, relayConfig);
    relay.start();
  });
}

export { app };
