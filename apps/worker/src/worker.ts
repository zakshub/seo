import { NativeConnection, Worker } from '@temporalio/worker';
import { fileURLToPath } from 'node:url';
import * as activities from './research-activities.js';
const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7233' });
const worker = await Worker.create({ connection, namespace: process.env.TEMPORAL_NAMESPACE ?? 'default', taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'venture-research', workflowsPath: fileURLToPath(new URL('../src/research-workflow.ts', import.meta.url)), activities });
await worker.run();
