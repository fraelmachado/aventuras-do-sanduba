const {test}=require('node:test'),a=require('node:assert/strict'),E=require('./engine.js');
function place(s,i){const q=s.platforms[i];Object.assign(s.player,{x:q.x+q.w/2-24,y:q.y-64,vy:0,vx:0,grounded:true,support:i});}
test('sky and night have their own mechanics and three sections',()=>{const sky=E.create(1),night=E.create(2);a.ok(sky.winds?.length>0);a.equal(sky.sections.length,3);a.equal(night.bells?.length,3);a.ok(night.platforms.some(q=>q.kind==='bridge'));});
test('umbrella slows falling only outside the garden',()=>{for(let l=0;l<3;l++){const s=E.create(l);Object.assign(s.player,{x:280,y:50,vy:500,grounded:false,support:-1});E.step(s,{jumpHeld:true},1/60);a.equal(s.player.gliding,l>0);if(l>0)a.ok(s.player.vy<=120);else a.ok(s.player.vy>500);}});
test('releasing umbrella restores normal falling',()=>{const s=E.create(1);Object.assign(s.player,{x:280,y:50,vy:500,grounded:false,support:-1});E.step(s,{jumpHeld:true},1/60);E.step(s,{jumpHeld:false},1/60);a.equal(s.player.gliding,false);a.ok(s.player.vy>115);});
test('bells light bridges, expire and can be rung again',()=>{const s=E.create(2);a.ok(s.bells?.length);const b=s.bells[0];Object.assign(s.player,{x:b.x-24,y:b.y-32,grounded:false});E.step(s,{},1/60);a.ok(s.bridgeTimers[0]>0);a.ok(s.events.includes('bell'));s.player.x=0;for(let i=0;i<500;i++)E.step(s,{},1/60);a.equal(s.bridgeTimers[0],0);Object.assign(s.player,{x:b.x-24,y:b.y-32});E.step(s,{},1/60);a.ok(s.bridgeTimers[0]>0);});
test('unlit bridges cannot catch Sanduba',()=>{const s=E.create(2),q=s.platforms.find(q=>q.kind==='bridge');Object.assign(s.player,{x:q.x+20,y:q.y-65,vy:100,grounded:false,support:-1});E.step(s,{},1/30);a.equal(s.player.grounded,false);a.ok(s.player.y+64>q.y);});
const simulate=require('./routes.cjs');
for(const fps of [30,60,120])for(const level of [1,2])test(`world ${level+1} continuous route at ${fps} FPS`,()=>{const s=simulate(level,fps);a.equal(s.complete,true);a.equal(s.rescues,0);a.equal(s.stars.filter(x=>x.taken).length,4);});
test('without umbrella the wide sky gap cannot be crossed',()=>{const s=E.create(1),q=s.platforms[1];place(s,1);s.player.x=q.x+q.w-55;let reached=false;for(let i=0;i<180;i++){E.step(s,{right:true,jump:i===0,jumpHeld:i<20},1/60);if(s.player.support===2)reached=true;}a.equal(reached,false);});
test('wind lifts an open umbrella; garden remains unaffected',()=>{const s=E.create(1),w=s.winds[0];Object.assign(s.player,{x:w.x+w.w/2-24,y:w.y+100,vy:30,grounded:false,support:-1});for(let i=0;i<20;i++)E.step(s,{jumpHeld:true},1/60);a.ok(s.player.vy<0);});
test('sky special item reached using updraft and closing umbrella',()=>{const s=E.create(1),n=s.platforms[15];place(s,11);s.player.x=s.platforms[11].x+s.platforms[11].w-55;for(let f=0;f<600&&!s.item.taken;f++){const p=s.player,over=p.x>n.x;E.step(s,{right:p.x<n.x+45,left:p.x>n.x+65,jump:f===0,jumpHeld:!over||p.y+p.h>n.y},1/60);}a.equal(s.item.taken,true);a.equal(s.rescues,0);});
test('night item can be collected from optional high island',()=>{const s=E.create(2),n=s.platforms[17];s.bridgeTimers[1]=9;place(s,6);s.player.x=s.platforms[6].x+s.platforms[6].w-55;for(let f=0;f<240&&!s.item.taken;f++){const p=s.player;E.step(s,{right:p.x<n.x+65,left:p.x>n.x+75,jump:f===0,jumpHeld:true},1/60);}a.equal(s.item.taken,true);});
for(const [level,from,wind] of [[1,5,3],[2,10,0]])test(`world ${level+1} hidden star is reached by hovering in the updraft, then the route continues`,()=>{
 const s=E.create(level),w=s.winds[wind],cx=w.x+w.w/2,star=s.stars.find(st=>st.x>w.x&&st.x<w.x+w.w&&st.y>w.y&&st.y<w.y+w.h);a.ok(star,'star sits inside the wind column');
 place(s,from);s.player.x=s.platforms[from].x+s.platforms[from].w-55;
 if(level===2)s.bridgeTimers.fill(60); // night: the player rings the bell before this stretch; keep its bridges lit
 for(let f=0;f<900&&!star.taken;f++){const p=s.player,c=p.x+p.w/2;E.step(s,{right:c<cx-6,left:c>cx+6,jump:f===0,jumpHeld:true},1/60);}
 a.equal(star.taken,true);a.equal(s.rescues,0);
 const n=s.platforms[from+1],tx=n.x+n.w/2;let landed=false;
 for(let f=0;f<600&&!landed;f++){const p=s.player,c=p.x+p.w/2;E.step(s,{right:c<tx-6,left:c>tx+6,jumpHeld:true},1/60);if(p.grounded&&p.support===from+1)landed=true;}
 a.ok(landed,'can still land on the next platform after the detour');a.equal(s.rescues,0);
});
