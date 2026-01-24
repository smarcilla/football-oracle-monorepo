import express from "express";
import { config } from "./config/index.js";
import { initKafka, subscribe } from "@football-oracle/kafka";
import { analyzeMatch } from "./handlers/analyze.js";

const app = express();
app.use(express.json());

// CORS for frontend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Trigger analysis
app.post("/analyze/:id?", analyzeMatch);

async function start(): Promise<void> {
  // Initialize Kafka
  try {
    await initKafka(config.kafka);

    // Subscribe to final event (don't await to not block server startup)
    subscribe("match.report_ready", async (message: any) => {
      console.log("[API] ========================================");
      console.log("[API] FLOW COMPLETED! Report ready:", message);
      console.log("[API] ========================================");
    }).catch((err) => console.error("[API] Kafka subscription error:", err));
  } catch (err) {
    console.error("[API] Kafka initialization failed:", err);
  }

  // Start server
  app.listen(config.port, () => {
    console.log(`[API] Server running on port ${config.port}`);
  });
}

start().catch(console.error);
