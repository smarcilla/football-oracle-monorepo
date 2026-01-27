import { publish } from '@football-oracle/kafka';

interface SimulationData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  iterations: number;
  results: {
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    mostLikelyScore: string;
    expectedGoals: {
      home: number;
      away: number;
    };
  };
}

export async function handleSimulationCompleted(message: object): Promise<void> {
  const data = message as SimulationData;

  console.log(`[Journalist] Processing match: ${data.matchId}`);
  console.log(`[Journalist] Generating match report (mock)...`);

  // Mock report - in real implementation this would call Genkit/LLM
  const mockReport = {
    matchId: data.matchId,
    title: `${data.homeTeam} vs ${data.awayTeam}: Analysis Report`,
    content: `
      Match Analysis: ${data.homeTeam} vs ${data.awayTeam}
      
      Based on ${data.iterations.toLocaleString()} Monte Carlo simulations:
      
      - ${data.homeTeam} win probability: ${(data.results.homeWinProb * 100).toFixed(1)}%
      - Draw probability: ${(data.results.drawProb * 100).toFixed(1)}%
      - ${data.awayTeam} win probability: ${(data.results.awayWinProb * 100).toFixed(1)}%
      
      Most likely score: ${data.results.mostLikelyScore}
      
      Expected goals: ${data.homeTeam} ${data.results.expectedGoals.home.toFixed(1)} - ${data.results.expectedGoals.away.toFixed(1)} ${data.awayTeam}
    `.trim(),
    generatedAt: new Date().toISOString(),
  };

  console.log(`[Journalist] Report generated:`, mockReport.title);

  await publish('match.report_ready', mockReport);
}
