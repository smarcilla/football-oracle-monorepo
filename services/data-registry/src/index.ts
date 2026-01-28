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
  app.listen(PORT, () => {
    console.log(`[Data Registry] Server running on port ${PORT}`);
  });
}

export { app };
