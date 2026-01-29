import { z } from 'zod';

export const CreateSimulationSchema = z.object({
  matchId: z.number().int().positive(),
  results: z.object({
    homeWinProb: z.number().min(0).max(1),
    drawProb: z.number().min(0).max(1),
    awayWinProb: z.number().min(0).max(1),
    iterations: z.number().int().positive(),
  }),
});

export const CreateReportSchema = z.object({
  matchId: z.number().int().positive(),
  content: z.string().min(10),
  provider: z.string().optional(),
});
