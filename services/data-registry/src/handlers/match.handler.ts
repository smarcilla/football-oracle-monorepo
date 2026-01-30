import { Request, Response } from 'express';
import { MatchService } from '../services/match.service.js';
import {
  getMatchesSchema,
  getMatchByIdSchema,
  bulkMatchesSchema,
} from '../validators/match.validator.js';
import { CreateSimulationSchema, CreateReportSchema } from '../validators/simulation.validator.js';
import { MatchStatus } from '@prisma/client';

export class MatchHandler {
  private service: MatchService;

  constructor(service?: MatchService) {
    this.service = service || new MatchService();
  }

  getMatches = async (req: Request, res: Response) => {
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
      const matches = await this.service.getMatches(result.data);
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

  getMatchById = async (req: Request, res: Response) => {
    const result = getMatchByIdSchema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid match ID',
      });
      return;
    }

    try {
      const match = await this.service.getMatchById(result.data.id);
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

  bulkCreateMatches = async (req: Request, res: Response) => {
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
      const createdMatches = await this.service.bulkCreateMatches(leagueId, seasonName, matches);
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

  updateMatchStatus = async (req: Request, res: Response) => {
    const paramResult = getMatchByIdSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid match ID',
      });
      return;
    }

    try {
      const { id } = paramResult.data;
      const { status } = req.body as { status: MatchStatus };

      if (!Object.values(MatchStatus).includes(status)) {
        res.status(400).json({ status: 'error', message: 'Invalid status' });
        return;
      }

      const match = await this.service.updateMatchStatus(id, status);
      res.json({ status: 'success', data: match });
    } catch (error: unknown) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  updateMatchData = async (req: Request, res: Response) => {
    const paramResult = getMatchByIdSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid match ID',
      });
      return;
    }

    try {
      const { id } = paramResult.data;
      const { rawShots } = req.body as { rawShots: unknown };

      if (!rawShots) {
        res.status(400).json({ status: 'error', message: 'rawShots is required' });
        return;
      }

      const match = await this.service.updateMatchData(id, rawShots);
      res.json({ status: 'success', data: match });
    } catch (error: unknown) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  createSimulation = async (req: Request, res: Response) => {
    const result = CreateSimulationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid simulation data',
        errors: result.error.errors,
      });
      return;
    }

    try {
      const simulation = await this.service.createSimulation(result.data);
      res.status(201).json({ status: 'success', data: simulation });
    } catch (error: unknown) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  createReport = async (req: Request, res: Response) => {
    const result = CreateReportSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid report data',
        errors: result.error.errors,
      });
      return;
    }

    try {
      const report = await this.service.createReport(result.data);
      res.status(201).json({ status: 'success', data: report });
    } catch (error: unknown) {
      res.status(400).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

const defaultHandler = new MatchHandler();
export const getMatches = defaultHandler.getMatches;
export const getMatchById = defaultHandler.getMatchById;
export const bulkCreateMatches = defaultHandler.bulkCreateMatches;
export const updateMatchStatus = defaultHandler.updateMatchStatus;
export const updateMatchData = defaultHandler.updateMatchData;
export const createSimulation = defaultHandler.createSimulation;
export const createReport = defaultHandler.createReport;
