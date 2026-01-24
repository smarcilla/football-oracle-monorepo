import { initKafka } from "@football-oracle/kafka";
import { config } from "./config/index.js";
import { handleDataExtracted } from "./handlers/simulation.js";
import { subscribe } from "@football-oracle/kafka";

async function start(): Promise<void> {
  console.log("[Engine] Starting Simulation Engine...");

  try {
    await initKafka(config.kafka);

    await subscribe("match.data_extracted", handleDataExtracted);
    console.log("[Engine] Subscribed to match.data_extracted");
  } catch (err) {
    console.error("[Engine] Kafka error:", err);
  }

  console.log("[Engine] Service is up and waiting for events...");
}


start().catch(console.error);
