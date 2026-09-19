const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const E=require('./engine.js');

test('renderer can draw every world and celebration using the packaged asset contract',async()=>{
 const drawn=[];
 const ctx=new Proxy({drawImage(image){drawn.push(image._src)}}, {get(target,key){
  if(key in target)return target[key];
  if(key==='createLinearGradient')return ()=>({addColorStop(){}});
  if(key==='getImageData')return ()=>({data:new Uint8ClampedArray(4)});
  if(key==='measureText')return ()=>({width:40});
  return ()=>{};
 }});
 const canvas={width:1100,height:650,getContext:()=>ctx,getBoundingClientRect:()=>({width:1100,height:650})};
 class ImageStub{constructor(){this.width=this.height=this.naturalWidth=1;this.complete=true;}set src(value){this._src=value;this.onload?.();}}
 const window={devicePixelRatio:1};
 const assets={garden:'garden',sky:'sky',night:'night',reef:'reef',pig:'pig',flight:'flight',swim:'swim1',swimKick:'swim2',fish:'fish',jelly:'jelly'};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'renderer.js'),'utf8'),
  {window,document:{createElement:()=>({width:1,height:1,getContext:()=>ctx})},Image:ImageStub,SandubaAssets:assets,devicePixelRatio:1});
 const renderer=window.SandubaRenderer(canvas);await renderer.ready;
 for(let level=0;level<4;level++){
  const s=E.create(level);
  assert.doesNotThrow(()=>renderer.draw(s,'playing',1,[]));
  s.complete=true;s.endingTime=1.6;
  assert.doesNotThrow(()=>renderer.draw(s,'ending',2,[]));
 }
 const sea=E.create(3);
 drawn.length=0;renderer.draw(sea,'playing',0,[]);const first=drawn.find(x=>x?.startsWith('swim'));
 sea.time=.25;drawn.length=0;renderer.draw(sea,'playing',.25,[]);const second=drawn.find(x=>x?.startsWith('swim'));
 assert.equal(first,'swim1');assert.equal(second,'swim2');
 drawn.length=0;renderer.draw(sea,'paused',20,[]);
 assert.equal(drawn.find(x=>x?.startsWith('swim')),'swim2');
 sea.player.x=1750;drawn.length=0;renderer.draw(sea,'playing',.5,[]);
 assert.ok(drawn.includes('fish'));
 assert.ok(drawn.includes('jelly'));
});
