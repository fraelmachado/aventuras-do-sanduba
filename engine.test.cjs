const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('./engine.js');
function place(s,i,x){const q=s.platforms[i];Object.assign(s.player,{x:x??q.x+25,y:q.y-64,vx:0,vy:0,grounded:true,support:i,coyote:0.12});}
function tick(s,input={},n=1,fps=60){for(let j=0;j<n;j++)E.step(s,input,1/fps);}
test('world has three distinct sections, five stars, optional bow and spaced flags',()=>{const s=E.create();assert.equal(s.sections.length,3);assert.ok(s.width>=6000);assert.equal(s.stars.length,5);assert.ok(s.platforms.filter(q=>q.checkpoint).length>=4);assert.ok(s.platforms.filter(q=>q.checkpoint).length<8);});
test('holding jump reaches higher than tapping',()=>{function apex(held){const s=E.create();place(s,0);let min=s.player.y;for(let j=0;j<60;j++){tick(s,{jump:j===0,jumpHeld:j<held});min=Math.min(min,s.player.y);}return min;}assert.ok(apex(40)<apex(2)-45);});
test('ordinary landing does not save; a flag does',()=>{const s=E.create();place(s,2);tick(s);assert.equal(s.checkpoint,0);place(s,9);tick(s);assert.equal(s.checkpoint,9);assert.ok(s.events.includes('checkpoint'));});
test('fall preserves collected stars and bow',()=>{const s=E.create();place(s,9);tick(s);s.stars[0].taken=true;s.bow.taken=true;s.player.y=950;tick(s);assert.equal(s.player.support,9);assert.equal(s.rescues,1);assert.ok(s.stars[0].taken&&s.bow.taken);});
test('moving leaves carry a standing player',()=>{const s=E.create(),i=s.platforms.findIndex(q=>q.moving);place(s,i);const dx=s.player.x-s.platforms[i].x;tick(s,{},30);assert.equal(s.player.support,i);assert.ok(Math.abs(s.player.x-s.platforms[i].x-dx)<0.01);});
test('cloud warns then vanishes, regenerates, and clears on rescue',()=>{const s=E.create(),i=s.platforms.findIndex(q=>q.kind==='crumbly'),q=s.platforms[i];place(s,i);tick(s,{},20);assert.ok(q.remaining<0.85&&q.remaining>0);tick(s,{},40);assert.ok(q.gone>0);s.player.y=950;tick(s);assert.equal(q.gone,0);assert.equal(q.remaining,0.85);place(s,i);tick(s,{},55);assert.ok(q.gone>0);place(s,0);tick(s,{},180);assert.equal(q.gone,0);});
test('arrival requires physical landing on final island; collection optional',()=>{const s=E.create();s.player.x=s.goal.x;s.player.y=s.goal.y-70;s.player.vy=-10;tick(s);assert.equal(s.complete,false);place(s,s.goal.platform,s.goal.x-24);tick(s);assert.equal(s.complete,true);assert.equal(s.stars.filter(q=>q.taken).length,0);});
for(const fps of [30,60,120])test(`every main route gap reachable with deliberate jump at ${fps} FPS`,()=>{for(let i=0;i<27;i++){const s=E.create(),q=s.platforms[i],target=s.platforms[i+1];place(s,i,q.x+q.w-55);let landed=false;for(let j=0;j<fps*3;j++){const p=s.player;E.step(s,{right:p.x<target.x+35,left:p.x>target.x+45,jump:j===0,jumpHeld:true},1/fps);if(j>2&&(p.grounded||s.events.includes('spring'))&&p.support===i+1){landed=true;break;}if(s.rescues)break;}assert.ok(landed,`gap ${i} -> ${i+1}`);}});
test('spring gives access to optional high route and bow',()=>{const s=E.create();place(s,15,s.platforms[15].x+s.platforms[15].w/2-24);let landed=false;for(let j=0;j<150;j++){const p=s.player;tick(s,{right:p.x<3500,left:p.x>3510,jumpHeld:true});if(p.grounded&&p.support===28){landed=true;break;}}assert.ok(landed);for(let j=0;j<100&&!s.bow.taken;j++){const p=s.player;tick(s,{right:p.x<3710,left:p.x>3720,jump:j===0,jumpHeld:true});}assert.ok(s.bow.taken);});
for(const fps of [30,60,120])test(`continuous garden traversal with spring and optional route at ${fps} FPS`,()=>{
 const s=E.create(),route=[...Array(16).keys(),28,29,18,19,20,21,22,23,24,25,26,27];let at=0,flight=false;
 for(let frame=0;frame<fps*100&&!s.complete;frame++){
  const p=s.player,q=s.platforms[route[at]],next=s.platforms[route[at+1]];if(!next)break;
  let right=false,left=false,jump=false;
  if(flight){right=p.x<next.x+35;left=p.x>next.x+45;if(p.support===route[at+1]&&(p.grounded||s.events.includes('spring'))){at++;flight=s.events.includes('spring');}}
  else{right=p.x<q.x+q.w-55;if(!right&&p.grounded){jump=true;flight=true;right=true;}}
  E.step(s,{right,left,jump,jumpHeld:true},1/fps);
 }
 assert.ok(s.complete);assert.equal(s.rescues,0);assert.ok(s.bow.taken);assert.equal(s.activeSection,2);
});
test('four ground stars collect once; the high star needs a held jump, a tap misses it',()=>{
 const s=E.create();const ground=s.stars.filter(star=>s.platforms.some(q=>star.x>=q.baseX&&star.x<=q.baseX+q.w&&star.y===q.baseY-55));assert.equal(ground.length,4);
 for(const star of ground){const i=s.platforms.findIndex(q=>star.x>=q.baseX&&star.x<=q.baseX+q.w&&star.y===q.baseY-55);place(s,i,star.x-24);tick(s);assert.ok(star.taken);tick(s);assert.ok(!s.events.includes('star'));}
 const high=s.stars.find(star=>!ground.includes(star));assert.ok(high);
 function reach(held){const r=E.create();place(r,7,high.x-24);for(let j=0;j<70;j++)tick(r,{jump:j===0,jumpHeld:held||j<2});return r.stars.some(st=>st.taken&&st.y===high.y);}
 assert.equal(reach(true),true);assert.equal(reach(false),false);
});
test('spring activates at mushroom pad, not at the ends of its leaf',()=>{const s=E.create(),q=s.platforms[15];place(s,15,q.x+q.w-48);tick(s);assert.ok(s.player.grounded);assert.ok(!s.events.includes('spring'));place(s,15,q.x+q.w/2-24);tick(s);assert.ok(s.events.includes('spring'));});
test('garden teaches held jumps after gentle opening',()=>{const s=E.create();assert.ok(s.platforms[0].y-s.platforms[1].y<40);for(const i of [5,7])assert.ok(s.platforms[i-1].y-s.platforms[i].y>=85);});
test('lily motion makes landing width and timing meaningful',()=>{const s=E.create();for(const i of [10,12,16]){const q=s.platforms[i];assert.ok(q.w<=130);assert.ok(q.ax>=35&&q.ay>=15&&q.speed>=1.1);}});
for(const fps of [30,60,120])test(`moving-leaf entries and exits remain reachable across motion cycle at ${fps} FPS`,()=>{
 for(const i of [9,10,11,12,15,16])for(let phase=0;phase<24;phase++){
  const s=E.create();s.time=phase*0.25;E.step(s,{},0);const q=s.platforms[i],target=s.platforms[i+1];place(s,i,q.x+q.w-55);let landed=false;
  for(let frame=0;frame<fps*3;frame++){
   const p=s.player;E.step(s,{right:p.x<target.x+25,left:p.x>target.x+35,jump:frame===0,jumpHeld:true},1/fps);
   if(frame>2&&p.grounded&&p.support===i+1){landed=true;break;}if(s.rescues)break;
  }
  assert.ok(landed,`gap ${i}, phase ${phase}`);
 }
});
test('higher garden steps require holding instead of tapping jump',()=>{
 for(const i of [4,6])for(const hold of [false,true]){
  const s=E.create(),q=s.platforms[i],target=s.platforms[i+1];place(s,i,q.x+q.w-55);let landed=false;
  for(let frame=0;frame<180;frame++){
   const p=s.player;tick(s,{right:p.x<target.x+30,left:p.x>target.x+40,jump:frame===0,jumpHeld:hold||frame<2});
   if(frame>2&&p.grounded&&p.support===i+1){landed=true;break;}if(s.rescues)break;
  }
  assert.equal(landed,hold,`gap ${i}, held ${hold}`);
 }
});
