import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const root=new URL('../',import.meta.url); const compose=['compose','-f','infrastructure/docker-compose.yml'];
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)); const docker=process.platform==='win32'?'docker.exe':'docker'; const pnpmCli=process.env.npm_execpath;
function runSync(bin,args,options={}) { return spawnSync(bin,args,{cwd:root,encoding:'utf8',...options}); }
async function reachable(url) { try { return (await fetch(url,{signal:AbortSignal.timeout(5000)})).ok; } catch { return false; } }
async function port(host,number) { const {createConnection}=await import('node:net'); return new Promise(resolve=>{const socket=createConnection({host,port:number});socket.once('connect',()=>{socket.destroy();resolve(true)});socket.once('error',()=>resolve(false));socket.setTimeout(1200,()=>{socket.destroy();resolve(false)});}); }

const status={ui:await reachable('http://127.0.0.1:3000'),api:await reachable('http://127.0.0.1:4000/api/health'),postgres:await port('127.0.0.1',5432),temporal:await port('127.0.0.1',7233)};
if(process.argv.includes('--check')) { console.log(JSON.stringify(status,null,2)); process.exit(Object.values(status).every(Boolean)?0:1); }
if(status.ui&&status.api&&status.postgres&&status.temporal) { console.log('Venture OS is already running: http://localhost:3000'); process.exit(0); }
if(runSync(docker,['info']).status!==0&&process.platform==='win32') { spawn('C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',[],{detached:true,windowsHide:true,stdio:'ignore'}).unref(); console.log('Starting Docker Desktop…'); for(let i=0;i<45&&runSync(docker,['info']).status!==0;i++)await sleep(2000); }
if(runSync(docker,['info']).status!==0)throw new Error('Docker is unavailable. Start Docker Desktop and run pnpm dev again.');
const infrastructure=runSync(docker,[...compose,'up','-d'],{stdio:'inherit'}); if(infrastructure.status!==0)process.exit(infrastructure.status??1);
for(let i=0;i<45&&!(await port('127.0.0.1',5432));i++)await sleep(1000);
if(!(await port('127.0.0.1',7233))) { runSync(docker,[...compose,'up','-d','temporal'],{stdio:'inherit'}); for(let i=0;i<45&&!(await port('127.0.0.1',7233));i++)await sleep(1000); }
const exists=runSync(docker,[...compose,'exec','-T','postgres','psql','-U','venture','-d','venture_os','-tAc',"select to_regclass('public.workspaces') is not null"]);
const migrations=exists.stdout.trim()==='t'?['packages/db/migrations/0002_research_candidates.sql']:['packages/db/migrations/0001_foundation.sql','packages/db/migrations/0002_research_candidates.sql'];
for(const path of migrations)await new Promise((resolve,reject)=>{const child=spawn(docker,[...compose,'exec','-T','postgres','psql','-v','ON_ERROR_STOP=1','-U','venture','-d','venture_os'],{cwd:root,stdio:['pipe','inherit','inherit']});child.stdin.end(readFileSync(new URL(path,root)));child.once('exit',code=>code===0?resolve():reject(new Error(`Migration failed: ${path}`)));});
const env={...process.env,LOCAL_OWNER_TOKEN:randomBytes(32).toString('hex')};
const services=[['API',['--filter','@venture/api','dev']],['Worker',['--filter','@venture/worker','dev']],['Control Center',['--filter','@venture/control-center','dev']]];
if(!pnpmCli)throw new Error('Run this launcher through pnpm dev so the pnpm CLI can be located.');
const children=services.map(([name,args])=>{console.log(`Starting ${name}…`);return spawn(process.execPath,[pnpmCli,...args],{cwd:root,env,stdio:'inherit'});});
const stop=()=>{for(const child of children)child.kill();}; process.on('SIGINT',stop);process.on('SIGTERM',stop); await Promise.race(children.map(child=>new Promise(resolve=>child.once('exit',resolve)))); stop();
