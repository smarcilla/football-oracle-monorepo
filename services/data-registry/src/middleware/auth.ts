import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env['INTERNAL_API_KEY'];

  if (!expectedApiKey) {
    console.warn('[Data Registry] Warning: INTERNAL_API_KEY is not set. API is unprotected.');
    return next();
  }

  if (apiKey !== expectedApiKey) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing API Key',
    });
    return;
  }

  next();
};
