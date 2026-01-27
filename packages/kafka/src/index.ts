import { Kafka, Producer } from 'kafkajs';

export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
}

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let currentGroupId: string = '';

export async function initKafka(config: KafkaConfig): Promise<void> {
  if (kafka) return;

  kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
  });
  currentGroupId = config.groupId;

  producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  });
  await producer.connect();
  console.log(`[Kafka] Connected as ${config.clientId}`);
}

export async function ensureTopics(topics: string[]): Promise<void> {
  if (!kafka) {
    throw new Error('Kafka not initialized. Call initKafka(config) first.');
  }

  const admin = kafka.admin();
  await admin.connect();
  const existingTopics = await admin.listTopics();

  const topicsToCreate = topics.filter((topic) => !existingTopics.includes(topic));
  if (topicsToCreate.length > 0) {
    await admin.createTopics({
      topics: topicsToCreate.map((topic) => ({ topic })),
    });
    console.log(`[Kafka] Created topics: ${topicsToCreate.join(', ')}`);
  } else {
    console.log('[Kafka] All topics already exist.');
  }

  await admin.disconnect();
}

export async function publish(topic: string, message: object): Promise<void> {
  if (!producer) {
    throw new Error('Kafka not initialized. Call initKafka(config) first.');
  }

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });

  console.log(`[Kafka] Published to ${topic}:`, message);
}

export async function subscribe(
  topic: string,
  handler: (message: object) => Promise<void>,
): Promise<void> {
  if (!kafka) {
    throw new Error('Kafka not initialized. Call initKafka(config) first.');
  }

  const consumer = kafka.consumer({
    groupId: currentGroupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    partitionsConsumedConcurrently: 1,
    eachMessage: async ({ message }) => {
      if (message.value) {
        const content = JSON.parse(message.value.toString()) as object;
        console.log(`[Kafka] Received from ${topic}:`, content);
        await handler(content);
      }
    },
  });
}

export async function disconnectKafka(): Promise<void> {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
  kafka = null;
}
