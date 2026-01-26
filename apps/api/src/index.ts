import express from 'express';
import { config } from './config/index.js';
import { initKafka, subscribe } from '@football-oracle/kafka';
import { analyzeMatch } from './handlers/analyze.js';

const app = express();
app.use(express.json());

// CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Trigger analysis
app.post('/analyze/:id?', analyzeMatch);

// Global Error Handler
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Internal Server Error',
    });
  },
);

async function start(): Promise<void> {
  // Initialize Kafka
  try {
    await initKafka(config.kafka);

    // Subscribe to final event (don't await to not block server startup)
    void subscribe('match.report_ready', (message: object) => {
      console.log('[API] ========================================');
      console.log('[API] FLOW COMPLETED! Report ready:', message);
      console.log('[API] ========================================');
      return Promise.resolve();
    }).catch((err: unknown) => console.error('[API] Kafka subscription error:', err));
  } catch (err) {
    console.error('[API] Kafka initialization failed:', err);
  }

  // Start server
  app.listen(config.port, () => {
    console.log(`[API] Server running on port ${config.port}`);
  });
}

try {
  await start();
} catch {
  console.error('Failed to start the server');
}
