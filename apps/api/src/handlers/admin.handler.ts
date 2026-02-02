import { Request, Response } from 'express';
import { z } from 'zod';
import { dataRegistryClient } from '../clients/data-registry.client.js';
import { LeagueSyncRequested } from '@football-oracle/types';

const syncLeagueSchema = z.object({
  leagueId: z.string(),
  year: z.string(),
});

export const syncLeague = async (req: Request, res: Response) => {
  const result = syncLeagueSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
      errors: result.error.errors,
    });
    return;
  }

  try {
    const { leagueId, year }: LeagueSyncRequested = result.data;

    // 1. Find the seasonId in Data Registry
    const season = await dataRegistryClient.getSeason(leagueId, year);

    if (!season) {
      res.status(404).json({
        status: 'error',
        message: `Season not found for league ${leagueId} and year ${year}`,
      });
      return;
    }

    // 2. Request synchronization
    await dataRegistryClient.requestSync(season.id);

    // 3. Return 202 Accepted as per ADR
    res.status(202).json({
      status: 'success',
      message: 'Synchronization request accepted',
      data: {
        seasonId: season.id,
      },
    });
  } catch (error) {
    console.error('[Admin Handler Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process synchronization request',
    });
  }
};
