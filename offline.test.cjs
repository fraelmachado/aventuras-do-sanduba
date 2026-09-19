const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

test('standalone HTML boots the bundled four-world game without external files',()=>{
 const html=fs.readFileSync(path.join(__dirname,'Sanduba nas Nuvens.html'),'utf8');
 assert.ok(Buffer.byteLength(html)<4_000_000);
 assert.ok(!html.includes('<script src='));
 assert.ok(!html.includes('rel="stylesheet"'));
 assert.ok(!html.includes('assets/touquinha.svg'));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 assert.equal(scripts.length,6);
 const ctx2d=new Proxy({}, {get(o,k){if(k in o)return o[k];
  if(k==='createLinearGradient')return ()=>({addColorStop(){}});
  if(k==='getImageData')return ()=>({data:new Uint8ClampedArray(4)});
  if(k==='measureText')return ()=>({width:50});
  return ()=>{};
 }});
 const nodes={},touches=['left','right','jump'].map(key=>node(key));
 function node(id){return {id,dataset:{key:id},hidden:false,disabled:false,style:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},firstElementChild:{style:{}},getContext:()=>ctx2d,getBoundingClientRect:()=>({width:1100,height:650}),focus(){},setAttribute(){},addEventListener(){},querySelectorAll(){return []}};}
 class ImageStub{constructor(){this.width=this.height=this.naturalWidth=1;this.complete=true;}set src(value){this.onload?.();}}
 let frame;
 const sandbox={document:{body:{dataset:{},classList:{add(){},remove(){}}},getElementById(id){return nodes[id]??=node(id)},createElement:()=>node('canvas'),querySelectorAll:()=>touches,querySelector:()=>touches[2],addEventListener(){}},Image:ImageStub,devicePixelRatio:1,requestAnimationFrame(fn){frame=fn},addEventListener(){},console,localStorage:{getItem(){return JSON.stringify({worlds:[0,1,2].map(()=>({stars:0,item:true,complete:true})),sound:false})},setItem(){}}};
 sandbox.window=sandbox;
 vm.createContext(sandbox);
 for(const script of scripts)vm.runInContext(script,sandbox);
 assert.equal(typeof sandbox.SandubaEngine.create,'function');
 assert.equal(sandbox.SandubaMusic.tracks.length,4);
 assert.ok(sandbox.SandubaAssets.swim.startsWith('data:image/webp;base64,'));
 assert.ok(sandbox.SandubaAssets.swimKick.startsWith('data:image/webp;base64,'));
 nodes['world-ocean'].onclick();
 assert.doesNotThrow(()=>frame(16));
 assert.equal(nodes['level-number'].textContent.includes('RECIFE'),true);
});
