import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

await connectDatabase();

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use. Stop the existing server or change PORT in server/.env.`);
    process.exit(1);
  }

  throw error;
});
