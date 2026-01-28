import { Request, Response } from 'express';
import { MatchService } from '../services/match.service.js';
import {
  getMatchesSchema,
  getMatchByIdSchema,
  bulkMatchesSchema,
} from '../validators/match.validator.js';

const matchService = new MatchService();

export const getMatches = async (req: Request, res: Response) => {
  const result = getMatchesSchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid query parameters',
      errors: result.error.errors,
    });
    return;
  }

  try {
    const matches = await matchService.getMatches(result.data);
    res.json({
      status: 'success',
      data: matches,
    });
  } catch (error) {
    console.error('[Handler Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch matches',
    });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  const result = getMatchByIdSchema.safeParse(req.params);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid match ID',
    });
    return;
  }

  try {
    const match = await matchService.getMatchById(result.data.id);
    if (!match) {
      res.status(404).json({
        status: 'error',
        message: 'Match not found',
      });
      return;
    }
    res.json({
      status: 'success',
      data: match,
    });
  } catch (error) {
    console.error('[Handler Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch match',
    });
  }
};

export const bulkCreateMatches = async (req: Request, res: Response) => {
  const result = bulkMatchesSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
      errors: result.error.errors,
    });
    return;
  }

  try {
    const { leagueId, seasonName, matches } = result.data;
    const createdMatches = await matchService.bulkCreateMatches(leagueId, seasonName, matches);
    res.status(201).json({
      status: 'success',
      data: {
        count: createdMatches.length,
      },
    });
  } catch (error) {
    console.error('[Handler Error]:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create matches',
    });
  }
};
