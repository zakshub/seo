import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule, { cors: true });
app.setGlobalPrefix('api');
await app.listen(Number(process.env.API_PORT ?? 4000), '127.0.0.1');
