import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const app = createApp();
const server = http.createServer(app);

const port = Number(process.env.PORT) || config.server.port || 5000;

server.listen(port, '0.0.0.0', () => {
  logger.info(
    `Portfolio Backend Server listening on http://0.0.0.0:${port}${config.server.apiPrefix}`,
    {
      environment: config.env,
      port
    }
  );
});

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Closing HTTP server and database connections...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Clean shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error disconnecting Prisma during shutdown', { error: String(err) });
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
