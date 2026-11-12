import {spawnSync} from 'node:child_process';
for(const method of ['m01-gsap-html','m10-data-viz','m16-diagram-as-code']){
  const result=spawnSync(process.execPath,['examples/_shared/capture.mjs',`examples/${method}/scene.html`,`output/${method}.mp4`],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
