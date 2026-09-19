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

test('currents, animals, checkpoints and rescue work in water',()=>{
 const s=E.create(3);
 assert.ok(s.currents.length>=3);
 assert.ok(s.animals.some(a=>a.kind==='jelly'));
 assert.ok(s.animals.some(a=>a.kind==='fish'));
 s.player.x=s.checkpoints[1].x;s.player.y=s.checkpoints[1].y;
 E.step(s,{},1/120);
 assert.equal(s.checkpoint,1);
 const a=s.animals[0];s.player.x=a.x-24;s.player.y=a.y-32;
 E.step(s,{},1/120);
 assert.ok(s.player.invulnerable>0);
 assert.ok(s.events.includes('bump'));
 const vx=s.player.vx;
 E.step(s,{},1/120);
 assert.ok(!s.events.includes('bump'));
 assert.ok(Number.isFinite(vx));
 s.stars[0].taken=true;s.item.taken=true;s.player.y=700;
 E.step(s,{},1/120);
 assert.equal(s.rescues,1);
 assert.equal(s.player.x,s.checkpoints[1].x);
 assert.ok(s.stars[0].taken&&s.item.taken);
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
 const s=E.create(3),targets=[...s.stars,s.item,s.goal];let at=0;
 for(let frame=0;frame<fps*120&&at<targets.length;frame++){
  const p=s.player,target=targets[at],cx=p.x+24,cy=p.y+32;
  E.step(s,{right:cx<target.x-8,left:cx>target.x+8,jumpHeld:cy>target.y+6},1/fps);
  if(target.taken||at===targets.length-1&&s.complete)at++;
 }
 assert.equal(at,targets.length);
 assert.equal(s.rescues,0);
 assert.equal(s.checkpoint,2);
});
