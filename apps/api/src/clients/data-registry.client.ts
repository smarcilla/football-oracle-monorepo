import { config } from '../config/index.js';

export interface SeasonResponse {
  id: number;
  name: string;
  leagueId: string;
  isActive: boolean;
  lastSyncAt: string | null;
}

export class DataRegistryClient {
  private readonly url: string;
  private readonly apiKey: string;

  constructor() {
    this.url = config.dataRegistry.url;
    this.apiKey = config.dataRegistry.apiKey;
  }

  async getSeason(leagueId: string, year: string): Promise<SeasonResponse | null> {
    const params = new URLSearchParams({ leagueId, year });
    const response = await fetch(`${this.url}/seasons?${params.toString()}`, {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`Data Registry error: ${response.statusText}`);
    }

    const { data } = (await response.json()) as { data: SeasonResponse };
    return data;
  }

  async requestSync(seasonId: number): Promise<void> {
    const response = await fetch(`${this.url}/seasons/${seasonId}/request-sync`, {
      method: 'PATCH',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Data Registry error: ${response.statusText}`);
    }
  }
}

export const dataRegistryClient = new DataRegistryClient();
