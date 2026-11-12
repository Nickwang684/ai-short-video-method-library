import {spawnSync} from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const folders=['examples/_shared','examples/m01-gsap-html','examples/m10-data-viz','examples/m16-diagram-as-code'];
for(const cwd of folders){
  const result=spawnSync(npm,['ci','--no-audit','--no-fund'],{cwd,stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
}
const result=spawnSync(npx,['playwright','install','chromium'],{cwd:'examples/_shared',stdio:'inherit',shell:process.platform==='win32'});
process.exit(result.status||0);
