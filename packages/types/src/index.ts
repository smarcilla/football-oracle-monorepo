// Event types for RabbitMQ messages

export interface MatchAnalysisRequested {
  matchId: string
  timestamp: string
}

export interface MatchDataExtracted {
  matchId: string
  homeTeam: string
  awayTeam: string
  shots: Shot[]
}

export interface Shot {
  player: string
  xG: number
  team: 'home' | 'away'
  result: string
}

export interface MatchSimulationCompleted {
  matchId: string
  homeTeam: string
  awayTeam: string
  iterations: number
  results: SimulationResults
}

export interface SimulationResults {
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  mostLikelyScore: string
  expectedGoals: {
    home: number
    away: number
  }
}

export interface MatchReportReady {
  matchId: string
  title: string
  content: string
  generatedAt: string
}
