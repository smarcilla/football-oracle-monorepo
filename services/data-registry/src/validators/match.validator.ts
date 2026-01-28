import { z } from 'zod';

export const getMatchesSchema = z.object({
  leagueId: z.string().optional(),
  seasonId: z.coerce.number().optional(),
  status: z
    .enum([
      'IDENTIFIED',
      'SCRAPING',
      'SCRAPED',
      'SIMULATING',
      'SIMULATED',
      'REPORTING',
      'COMPLETED',
      'FAILED',
    ])
    .optional(),
});

export type GetMatchesQuery = z.infer<typeof getMatchesSchema>;

export const getMatchByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const bulkMatchesSchema = z.object({
  leagueId: z.string(),
  seasonName: z.string(),
  matches: z.array(
    z.object({
      id: z.number(),
      date: z.string().datetime(),
      homeTeamId: z.number(),
      awayTeamId: z.number(),
    }),
  ),
});

export type BulkMatchesInput = z.infer<typeof bulkMatchesSchema>;
