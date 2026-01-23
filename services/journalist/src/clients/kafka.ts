import { Kafka, Producer, Consumer } from "kafkajs";
import { config } from "../config/index.js";

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
});

let producer: Producer | null = null;

export async function connectKafka(): Promise<void> {
  producer = kafka.producer();
  await producer.connect();
  console.log("[Kafka] Producer connected");
}

export async function publish(topic: string, message: object): Promise<void> {
  if (!producer) {
    await connectKafka();
  }

  await producer!.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });

  console.log(`[Kafka] Published to ${topic}:`, message);
}

export async function subscribe(
  topic: string,
  handler: (message: object) => Promise<void>,
): Promise<void> {
  const consumer = kafka.consumer({ groupId: config.kafka.groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (message.value) {
        const content = JSON.parse(message.value.toString());
        console.log(`[Kafka] Received from ${topic}:`, content);
        await handler(content);
      }
    },
  });
}

export async function closeKafka(): Promise<void> {
  if (producer) await producer.disconnect();
}
