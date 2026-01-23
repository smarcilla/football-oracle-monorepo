import amqp from 'amqplib'
import type { Channel, ChannelModel } from 'amqplib'
import { config } from '../config/index.js'

let connection: ChannelModel | null = null
let channel: Channel | null = null

const EXCHANGE = 'football_oracle'

export async function connectRabbitMQ(): Promise<Channel> {
  if (channel) return channel

  // Retry logic
  let retries = 10
  while (retries > 0) {
    try {
      connection = await amqp.connect(config.rabbitmq.url)
      channel = await connection.createChannel()
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true })
      console.log('[RabbitMQ] Connected and exchange created')
      return channel
    } catch (error) {
      retries--
      console.log(`[RabbitMQ] Connection failed, retrying... (${retries} left)`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw new Error('Could not connect to RabbitMQ')
}

export async function publish(routingKey: string, message: object): Promise<void> {
  if (!channel) throw new Error('RabbitMQ not connected')

  const content = Buffer.from(JSON.stringify(message))
  channel.publish(EXCHANGE, routingKey, content, { persistent: true })

  console.log(`[RabbitMQ] Published to ${routingKey}:`, message)
}

export async function subscribe(
  routingKey: string,
  handler: (message: object) => Promise<void>
): Promise<void> {
  if (!channel) throw new Error('RabbitMQ not connected')

  const queue = await channel.assertQueue('', { exclusive: true })
  await channel.bindQueue(queue.queue, EXCHANGE, routingKey)

  console.log(`[RabbitMQ] Subscribed to ${routingKey}`)

  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString())
      console.log(`[RabbitMQ] Received from ${routingKey}:`, content)
      await handler(content)
      channel!.ack(msg)
    }
  })
}

export async function closeRabbitMQ(): Promise<void> {
  if (channel) await channel.close()
  if (connection) await connection.close()
}
