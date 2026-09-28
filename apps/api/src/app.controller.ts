import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './database.service.js';
import { TemporalService } from './temporal.service.js';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService, private readonly temporal: TemporalService) {}
  @Get('health') async health() { return { status: 'ok', database: 'available', databaseTime: await this.db.health(), temporal: await this.temporal.availability(), researchProvider: 'unavailable', reason: 'No approved public research source is configured.' }; }
  @Get('overview') async overview() { return this.db.overview(); }
  @Get('activity') async activity() { return this.db.activity(); }
  @Post('workflows/research') async start(@Headers('x-local-owner-token') token: string | undefined, @Headers('idempotency-key') key: string | undefined, @Body() body: { language?:string; market?:string }) {
    const expected = process.env.LOCAL_OWNER_TOKEN;
    if (!expected || token !== expected) throw new HttpException('Local owner authentication is required.', HttpStatus.UNAUTHORIZED);
    if ((body.language ?? 'en') !== 'en' || (body.market ?? 'global') !== 'global') throw new HttpException('The first slice currently supports English/global research only.', HttpStatus.BAD_REQUEST);
    const run = await this.db.startResearch(key ?? randomUUID());
    if (!run.idempotent && run.state === 'created') {
      const dispatch = await this.temporal.dispatchResearch(run.id);
      if (dispatch.availability === 'available') await this.db.markDispatched(run.id, dispatch.workflowId);
      else await this.db.markDispatchUnavailable(run.id, dispatch.reason);
    }
    return this.db.workflow(run.id);
  }
}
