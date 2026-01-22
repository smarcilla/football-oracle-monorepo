import { connectRabbitMQ, subscribe } from './clients/rabbitmq.js'
import { handleSimulationCompleted } from './handlers/report.js'

async function start(): Promise<void> {
  console.log('[Journalist] Starting Journalist Agent...')

  await connectRabbitMQ()

  await subscribe('match.simulation_completed', handleSimulationCompleted)

  console.log('[Journalist] Waiting for messages...')
}

start().catch(console.error)
