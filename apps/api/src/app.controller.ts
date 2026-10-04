import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from './database.service.js';
import { TemporalService } from './temporal.service.js';
import { isOwnerAuthenticated } from './owner-auth.js';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService, private readonly temporal: TemporalService) {}
  @Get('health') async health() { return { status: 'ok', database: 'available', databaseTime: await this.db.health(), temporal: await this.temporal.availability(), researchProvider: 'available', researchProviderName: 'stackexchange-public-api', researchLimitation: 'Public Q&A problem signal; not keyword volume, live SERP evidence, or commercial validation.' }; }
  @Get('overview') async overview() { return this.db.overview(); }
  @Get('activity') async activity() { return this.db.activity(); }
  @Get('opportunities') async opportunities() { return this.db.opportunities(); }
  @Get('approvals') async approvals() { return this.db.approvals(); }
  @Get('market-studies') async marketStudies() { return this.db.marketStudies(); }
  @Post('workflows/research') async start(@Headers('x-local-owner-token') token: string | undefined, @Headers('idempotency-key') key: string | undefined, @Body() body: { language?:string; market?:string; brief?:string }) {
    const expected = process.env.LOCAL_OWNER_TOKEN;
    if (!isOwnerAuthenticated(expected,token)) throw new HttpException('Local owner authentication is required.', HttpStatus.UNAUTHORIZED);
    if ((body.language ?? 'en') !== 'en' || (body.market ?? 'global') !== 'global') throw new HttpException('The first slice currently supports English/global research only.', HttpStatus.BAD_REQUEST);
    const brief=(body.brief ?? 'Find the strongest public web-property opportunities related to SEO, technical SEO, search visibility and website growth.').trim();
    if (brief.length < 10 || brief.length > 2000) throw new HttpException('Study brief must be between 10 and 2000 characters.', HttpStatus.BAD_REQUEST);
    const run = await this.db.startResearch(key ?? randomUUID(),brief);
    if (!run.idempotent && run.state === 'created') {
      const dispatch = await this.temporal.dispatchResearch(run.id,run.marketStudyId,brief);
      if (dispatch.availability === 'available') await this.db.markDispatched(run.id, dispatch.workflowId);
      else await this.db.markDispatchUnavailable(run.id, dispatch.reason);
    }
    return this.db.workflow(run.id);
  }
  @Post('approvals/:id/decision') async decide(@Headers('x-local-owner-token') token: string | undefined, @Param('id') id: string, @Body() body: { decision?:string; opportunityId?:string; note?:string }) {
    const expected = process.env.LOCAL_OWNER_TOKEN;
    if (!isOwnerAuthenticated(expected,token)) throw new HttpException('Local owner authentication is required.',HttpStatus.UNAUTHORIZED);
    if (!['approve','reject','request_changes'].includes(body.decision ?? '')) throw new HttpException('Decision must be approve, reject, or request_changes.',HttpStatus.BAD_REQUEST);
    if (!body.opportunityId) throw new HttpException('An opportunity must be selected.',HttpStatus.BAD_REQUEST);
    // The database transition requires this exact pending, scoped approval before project creation.
    return this.db.decideApproval(id,body.decision as 'approve'|'reject'|'request_changes',body.opportunityId,body.note);
  }
}
