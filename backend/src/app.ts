import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { localizationMiddleware } from './middleware/localization';

export function createApp(): Express {
  const app = express();

  // Security headers with relaxed cross-origin resource policy for uploaded files
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: '*', // Allow frontend dev server and preview origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
      exposedHeaders: ['Content-Language'],
    })
  );

  // Localization middleware
  app.use(localizationMiddleware);

  // Request logger
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // JSON & URL-encoded request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(config.uploadDir));

  // Graceful fallback handler for missing uploaded documents
  app.use('/uploads', (req: Request, res: Response) => {
    const filename = path.basename(req.path);
    res.status(404).json({
      success: false,
      error: 'DOCUMENT_NOT_FOUND',
      message: `The requested official document "${filename}" was not found or has been archived by the department.`,
    });
  });

  // Mount unified API routes
  app.use('/api', apiRouter);

  // Root welcome route
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'ProjectSetu API',
      tagline: 'Connecting Departments. Connecting Projects. Enabling Smarter Governance.',
      documentation: '/api/health',
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
