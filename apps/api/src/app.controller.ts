import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './database.service.js';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) {}
  @Get('health') async health() { return { status: 'ok', database: 'available', databaseTime: await this.db.health(), researchProvider: 'unavailable', reason: 'No approved public research source is configured.' }; }
  @Get('overview') async overview() { return this.db.overview(); }
  @Post('workflows/research') async start(@Headers('x-local-owner-token') token: string | undefined, @Headers('idempotency-key') key: string | undefined, @Body() body: { language?:string; market?:string }) {
    const expected = process.env.LOCAL_OWNER_TOKEN;
    if (!expected || token !== expected) throw new HttpException('Local owner authentication is required.', HttpStatus.UNAUTHORIZED);
    if ((body.language ?? 'en') !== 'en' || (body.market ?? 'global') !== 'global') throw new HttpException('The first slice currently supports English/global research only.', HttpStatus.BAD_REQUEST);
    return this.db.startResearch(key ?? randomUUID());
  }
}
