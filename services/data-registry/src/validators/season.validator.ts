import { z } from 'zod';

export const getSeasonByLeagueAndYearSchema = z.object({
  leagueId: z.string(),
  year: z.string(),
});

export const requestSyncSchema = z.object({
  id: z.coerce.number().int().positive(),
});
