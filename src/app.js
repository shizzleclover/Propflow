import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { buildOpenApiSpec } from './config/swagger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import { authRoutes } from './modules/auth/routes.js';
import { usersRoutes } from './modules/users/routes.js';
import { propertiesRoutes } from './modules/properties/routes.js';
import { bookingsRoutes } from './modules/bookings/routes.js';
import { crmRoutes } from './modules/crm/routes.js';
import { dashboardRoutes } from './modules/dashboard/routes.js';

export function createApp() {
  const app = express();
  const openApiSpec = buildOpenApiSpec();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.LOG_FORMAT));

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/openapi.json', (_req, res) => res.json(openApiSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/auth', authRoutes());
  app.use('/users', usersRoutes());
  app.use('/properties', propertiesRoutes());
  app.use('/bookings', bookingsRoutes());
  app.use('/crm', crmRoutes());
  app.use('/dashboard', dashboardRoutes());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

