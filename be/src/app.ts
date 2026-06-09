import type { Route } from './core/interfaces/index.js';
import { connectDatabase } from './core/database/index.js';
import { globalExceptionHandler, malformedErrorHandler } from './core/exceptions/exception.middleware.js';
import { env } from './env.js';
import { LogScope, logger, loggingMiddleware } from './core/logger/index.js';
import express from 'express';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.js';

class App {
  public app: express.Application;
  public port: number | string;
  public production: boolean;

  constructor(routes: Route[]) {
    this.app = express();
    this.port = env.PORT;
    this.production = env.NODE_ENV === 'production' ? true : false;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.connectToDatabase();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`${LogScope.APP} App listening on the port ${this.port}`);
    });
  }
  private initializeRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(loggingMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    if (this.production) {
      this.app.use(hpp());
      this.app.use(
        cors({
          origin: env.CORS_ALLOWED_ORIGINS.length > 0 ? env.CORS_ALLOWED_ORIGINS : false,
          credentials: env.CORS_CREDENTIALS
        })
      );
      this.app.use(helmet());
      this.app.use(compression());
    } else {
      this.app.use(cors({ origin: true, credentials: env.CORS_CREDENTIALS }));
    }
  }

  private initializeErrorHandling(): void {
    this.app.use(malformedErrorHandler);
    this.app.use(globalExceptionHandler);
  }

  private async connectToDatabase(): Promise<void> {
    try {
      await connectDatabase();
      logger.info(`${LogScope.DATABASE} Connected to the database successfully`);
    } catch (error) {
      logger.error(error, `${LogScope.DATABASE} Database connection failed`);
    }
  }

  private initializeSwagger(): void {
    this.app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}

export default App;
