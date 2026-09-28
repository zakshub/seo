import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DatabaseService } from './database.service.js';
import { TemporalService } from './temporal.service.js';

@Module({ controllers: [AppController], providers: [DatabaseService, TemporalService] })
export class AppModule {}
