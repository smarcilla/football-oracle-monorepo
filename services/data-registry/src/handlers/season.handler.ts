import { Request, Response } from 'express';
import { SeasonService } from '../services/season.service.js';
import {
  getSeasonByLeagueAndYearSchema,
  requestSyncSchema,
} from '../validators/season.validator.js';

export class SeasonHandler {
  private readonly service: SeasonService;

  constructor(service?: SeasonService) {
    this.service = service || new SeasonService();
  }

  getSeasonByLeagueAndYear = async (req: Request, res: Response) => {
    const result = getSeasonByLeagueAndYearSchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid query parameters',
        errors: result.error.errors,
      });
      return;
    }

    try {
      const { leagueId, year } = result.data;
      const season = await this.service.getSeasonByLeagueAndYear(leagueId, year);
      if (!season) {
        res.status(404).json({
          status: 'error',
          message: 'Season not found',
        });
        return;
      }
      res.json({
        status: 'success',
        data: season,
      });
    } catch (error) {
      console.error('[Handler Error]:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch season',
      });
    }
  };

  requestSync = async (req: Request, res: Response) => {
    const result = requestSyncSchema.safeParse(req.params);

    if (!result.success) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid season ID',
      });
      return;
    }

    try {
      await this.service.requestSync(result.data.id);
      res.json({
        status: 'success',
        message: 'Sync request registered',
      });
    } catch (error) {
      console.error('[Handler Error]:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to request sync',
      });
    }
  };
}

const defaultHandler = new SeasonHandler();
export const getSeasonByLeagueAndYear = defaultHandler.getSeasonByLeagueAndYear;
export const requestSync = defaultHandler.requestSync;
