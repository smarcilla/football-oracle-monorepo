import { publish } from "@football-oracle/kafka";

interface ShotData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  shots: Array<{
    player: string;
    xG: number;
    team: "home" | "away";
    result: string;
  }>;
}

export async function handleDataExtracted(message: object): Promise<void> {
  const data = message as ShotData;

  console.log(`[Engine] Processing match: ${data.matchId}`);
  console.log(`[Engine] Running Monte Carlo simulation (mock)...`);
  console.log(`[Engine] ${data.homeTeam} vs ${data.awayTeam}`);

  // Mock simulation - in real implementation this would run 100k iterations
  const mockSimulation = {
    matchId: data.matchId,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    iterations: 100000,
    results: {
      homeWinProb: 0.45,
      drawProb: 0.28,
      awayWinProb: 0.27,
      mostLikelyScore: "2-1",
      expectedGoals: {
        home: 1.8,
        away: 1.2,
      },
    },
  };

  console.log(`[Engine] Simulation complete:`, mockSimulation.results);

  await publish("match.simulation_completed", mockSimulation);
}
