import { connectRabbitMQ, subscribe } from './clients/rabbitmq.js'
import { handleDataExtracted } from './handlers/simulation.js'

async function start(): Promise<void> {
  console.log('[Engine] Starting Simulation Engine...')

  await connectRabbitMQ()

  await subscribe('match.data_extracted', handleDataExtracted)

  console.log('[Engine] Waiting for messages...')
}

start().catch(console.error)
