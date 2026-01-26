import { initKafka, subscribe } from '@football-oracle/kafka';
import { config } from './config/index.js';
import { handleSimulationCompleted } from './handlers/report.js';

async function start(): Promise<void> {
  console.log('[Journalist] Starting Journalist Agent...');

  try {
    await initKafka(config.kafka);

    await subscribe('match.simulation_completed', handleSimulationCompleted);
    console.log('[Journalist] Subscribed to match.simulation_completed');
  } catch (err) {
    console.error('[Journalist] Kafka error:', err);
  }

  console.log('[Journalist] Service is up and waiting for events...');
}

start().catch(console.error);
