// Event types and topics for Kafka communication

export enum BusinessTopic {
  LEAGUE_SYNC_REQUESTED = 'league.sync.requested',
  LEAGUE_SYNCED = 'league.synced',
  MATCH_ANALYSIS_REQUESTED = 'match.analysis.requested',
  MATCH_DATA_SCRAPED = 'match.data.scraped',
  MATCH_SIMULATION_COMPLETED = 'match.simulation.completed',
  MATCH_REPORT_GENERATED = 'match.report.generated',
}

export interface LeagueSynced {
  league: string;
  year: string;
  matchesCount: number;
}

export interface MatchDataScraped {
  matchId: number;
  shotsCount: number;
}

export interface MatchSimulationCompleted {
  matchId: number;
  winnerProb: 'home' | 'draw' | 'away'; // Simplified for the event signal
}

export interface MatchReportGenerated {
  matchId: number;
  reportId: number;
}

export interface MatchAnalysisRequested {
  matchId: string;
  timestamp: string;
}

export interface MatchDataExtracted {
  matchId: string;
  metadata: {
    league: string;
    homeTeam: TeamMetadata;
    awayTeam: TeamMetadata;
    realScore: {
      home: number;
      away: number;
    };
  };
  shots: ShotEvent[];
  scrapedAt: string;
}

export interface TeamMetadata {
  id: number;
  name: string;
  colors: {
    primary: string;
    secondary?: string;
  };
}

export interface ShotEvent {
  playerName: string;
  team: 'home' | 'away';
  minute: number;
  xg: number;
  result: 'goal' | 'miss' | 'save' | 'block';
  situation: string;
  bodyPart: string;
}

export interface MatchSimulationCompleted {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  iterations: number;
  results: SimulationResults;
}

export interface SimulationResults {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  mostLikelyScore: string;
  expectedGoals: {
    home: number;
    away: number;
  };
}

export interface MatchReportReady {
  matchId: number;
  title: string;
  content: string;
  generatedAt: string;
}
