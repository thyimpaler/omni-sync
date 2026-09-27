/** Boots the service: HTTP surface plus the SLA worker on one process. */

import { buildApp } from './app.ts';
import { metaClient, recordingClient } from './channels.ts';
import { loadConfig } from './config.ts';
import { connect } from './db.ts';
import { startWorker } from './worker.ts';

const config = loadConfig();
const db = connect(config.databaseUrl);

// Without a Graph URL the service records outbound messages instead of sending
// them, which is the development and Meta-review-pending path.
const channels = config.metaGraphUrl
    ? metaClient(config.metaGraphUrl, async () => process.env.META_ACCESS_TOKEN ?? null)
    : recordingClient();

const app = buildApp({ db, config, channels });
const worker = startWorker(db, { logger: app.log });

async function shutdown(signal: string): Promise<void> {
    app.log.info({ signal }, 'shutting down');
    worker.stop();
    await app.close();
    await db.end();
    process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ port: config.port, host: config.host });
