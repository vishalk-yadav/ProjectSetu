import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`================================================================`);
  console.log(`  PROJECTSETU - INTEGRATED GOVERNMENT MONITORING PLATFORM BACKEND `);
  console.log(`  Tagline: Connecting Departments. Connecting Projects.          `);
  console.log(`  Status: Running on http://localhost:${config.port}              `);
  console.log(`  API Health: http://localhost:${config.port}/api/health         `);
  console.log(`================================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
