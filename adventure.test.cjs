const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('./engine.js');

test('every world has a distinct mandatory item before its goal',()=>{
 const names=['Flor Dourada','Gota de Nuvem','Luazinha','Pérola-Coração'];
 for(let i=0;i<4;i++){
  const s=E.create(i);
  assert.equal(s.item.name,names[i]);
  assert.ok(s.item.x<s.goal.x);
  assert.equal(s.stars.length,5);
  assert.equal(s.sections.length,3);
 }
});

test('arriving without the item gives a gentle hint and permits returning',()=>{
 const s=E.create(0),q=s.platforms[s.goal.platform];
 Object.assign(s.player,{x:s.goal.x-20,y:q.y-64,grounded:true,support:s.goal.platform});
 E.step(s,{},1/120);
 assert.equal(s.complete,false);
 assert.ok(s.events.includes('needItem'));
 E.returnToItem(s);
 assert.ok(s.player.x<s.item.x);
 assert.equal(s.stars.filter(v=>v.taken).length,0);
 s.player.x=s.item.x-24;s.player.y=s.item.y-32;s.player.grounded=false;
 E.step(s,{},1/120);
 assert.equal(s.item.taken,true);
 Object.assign(s.player,{x:s.goal.x-20,y:q.y-64,grounded:true,support:s.goal.platform});
 E.step(s,{},1/120);
 assert.equal(s.complete,true);
});

for(const fps of [30,60,120])test(`swimming is stable at ${fps} FPS`,()=>{
 const s=E.create(3);
 for(let i=0;i<fps;i++)E.step(s,{right:true,jumpHeld:true},1/fps);
 assert.ok(s.player.x>110&&s.player.x<300,s.player.x);
 assert.ok(s.player.y<310&&s.player.y>60,s.player.y);
 const up=s.player.y;
 for(let i=0;i<fps;i++)E.step(s,{jumpHeld:false},1/fps);
 assert.ok(s.player.y>up);
 assert.ok(Math.abs(s.player.vx)<15);
});

test('animal contact returns to last buoy and preserves collected items',()=>{
 const s=E.create(3);
 assert.ok(s.currents.length>=3);
 assert.ok(s.animals.some(a=>a.kind==='jelly'));
 assert.ok(s.animals.some(a=>a.kind==='fish'));
 s.player.x=s.checkpoints[1].x;s.player.y=s.checkpoints[1].y;
 E.step(s,{},1/120);
 assert.equal(s.checkpoint,1);
 s.stars[0].taken=true;s.item.taken=true;
 const a=s.animals[0];s.player.x=a.x-24;s.player.y=a.y-32;
 E.step(s,{},1/120);
 assert.ok(s.events.includes('rescue'));
 assert.equal(s.events.includes('bump'),false);
 assert.equal(s.rescueReason,'animal');
 assert.equal(s.rescues,1);
 assert.equal(s.player.x,s.checkpoints[1].x);
 assert.equal(s.player.y,s.checkpoints[1].y);
 assert.ok(s.stars[0].taken&&s.item.taken);
 E.step(s,{},1/120);
 assert.equal(s.rescues,1);
 const jelly=s.animals.find(a=>a.kind==='jelly');
 Object.assign(s.player,{x:jelly.liveX-24,y:jelly.liveY-32,invulnerable:0});
 E.step(s,{},1/120);
 assert.equal(s.rescues,2);
 assert.equal(s.player.x,s.checkpoints[1].x);
});

test('leaving water bounds returns to the last buoy',()=>{
 const s=E.create(3);s.player.x=s.checkpoints[1].x;s.player.y=s.checkpoints[1].y;
 E.step(s,{},1/120);s.stars[0].taken=true;s.item.taken=true;s.player.y=700;
 E.step(s,{},1/120);
 assert.equal(s.rescues,1);
 assert.equal(s.rescueReason,'bounds');
 assert.equal(s.player.x,s.checkpoints[1].x);
 assert.ok(s.stars[0].taken&&s.item.taken);
});

test('releasing swim control lets Sanduba descend inside each upward current',()=>{
 const s=E.create(3);
 for(const w of s.currents.filter(w=>w.vy<0)){
  Object.assign(s.player,{x:w.x+45,y:w.y+80,vx:0,vy:0,invulnerable:1});
  const before=s.player.y;
  for(let i=0;i<120;i++)E.step(s,{jumpHeld:false},1/120);
  assert.ok(s.player.y>before+8,`corrente em ${w.x}: ${s.player.y-before}`);
 }
});

test('the ocean goal requires the pearl but not all shells',()=>{
 const s=E.create(3);
 s.player.x=s.goal.x-24;s.player.y=s.goal.y-32;
 E.step(s,{},1/120);
 assert.equal(s.complete,false);
 assert.ok(s.events.includes('needItem'));
 s.item.taken=true;
 E.step(s,{},1/120);
 assert.equal(s.complete,true);
 assert.equal(s.stars.filter(x=>x.taken).length,0);
});

for(const fps of [30,60,120])test(`reef route reaches all shells, pearl and arch at ${fps} FPS`,()=>{
 // A deliberate path uses the open lane above the first animals and returns for shells.
 const s=E.create(3),waypoints=[[440,320,0],[1070,150,1],[1550,130],[1980,130],[2050,440,2],[2050,145],[2950,145],[3310,280,3],[3310,425],[3815,430,4],[3815,145],[4140,245,'item'],[4470,310,'goal']];let at=0;
 for(let frame=0;frame<fps*120&&at<waypoints.length;frame++){
  const p=s.player,[x,y,collect]=waypoints[at],cx=p.x+24,cy=p.y+32;
  E.step(s,{right:cx<x-8,left:cx>x+8,jumpHeld:cy>y+6},1/fps);
  if(collect===undefined?Math.abs(cx-x)<24&&Math.abs(cy-y)<30:collect==='goal'?s.complete:collect==='item'?s.item.taken:s.stars[collect].taken)at++;
 }
 assert.equal(at,waypoints.length);
 assert.equal(s.rescues,0);
 assert.equal(s.checkpoint,2);
});
