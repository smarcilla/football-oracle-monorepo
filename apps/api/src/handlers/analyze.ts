import type { Request, Response } from "express";
import { publish } from "@football-oracle/kafka";

export async function analyzeMatch(req: Request, res: Response): Promise<void> {
  const matchId = req.params.id || "test-match-123";

  console.log(`[API] Received analyze request for match: ${matchId}`);

  await publish("match.analysis_requested", {
    matchId,
    timestamp: new Date().toISOString(),
  });

  res.json({
    status: "accepted",
    message: `Analysis started for match ${matchId}`,
  });
}
