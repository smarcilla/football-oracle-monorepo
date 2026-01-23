import { connectKafka, subscribe } from "./clients/kafka.js";
import { handleDataExtracted } from "./handlers/simulation.js";

async function start(): Promise<void> {
  console.log("[Engine] Starting Simulation Engine...");

  await connectKafka();

  await subscribe("match.data_extracted", handleDataExtracted);

  console.log("[Engine] Waiting for messages...");
}

start().catch(console.error);
