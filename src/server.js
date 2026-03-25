import 'express-async-errors';
import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb } from './lib/db.js';

async function main() {
  await connectDb(env.MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`PropFlow API listening on :${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err);
  process.exit(1);
});

