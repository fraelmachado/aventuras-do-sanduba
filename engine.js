(function(root){
'use strict';
const names=['Jardim dos Pulos','Nuvens de Algodão','Céu Estrelado'];
const buildWorld=typeof module!=='undefined'?require('./worlds.js'):root.SandubaWorlds;
const CRUMBLE=0.85,REAPPEAR=2.8;
function platform(x,y,w=170,extra={}){return {x,y,baseX:x,baseY:y,w,h:30,kind:'island',spring:false,checkpoint:false,moving:false,ax:0,ay:0,phase:0,speed:1,remaining:CRUMBLE,gone:0,...extra};}
function create(level=0){
 level=Math.max(0,Math.min(2,level));let platforms,sections,width,starIndices,goalIndex,bow,winds=[],bells=[];
 if(level===0){
  const xs=[0,260,475,690,905,1120,1335,1550,1765,1980,2220,2440,2660,2880,3100,3320,3540,3760,4000,4240,4460,4680,4900,5120,5340,5560,5760,5940];
  const ys=[530,510,480,525,470,375,485,395,500,520,490,455,500,465,420,460,500,460,520,480,435,480,440,485,450,500,475,500];
  platforms=xs.map((x,i)=>platform(x,ys[i],[0,9,18,27].includes(i)?210:([10,12,16].includes(i)?120:([3,7,14,22].includes(i)?145:170)),{checkpoint:[0,9,18,26].includes(i),kind:i>=19&&i<=25?([20,22,24].includes(i)?'crumbly':'cloud'):i>=10&&i<=17?'leaf':'island',spring:i===15,moving:[10,12,16].includes(i),ax:[10,12,16].includes(i)?35:0,ay:[10,12,16].includes(i)?15:0,phase:i*0.4,speed:1.1}));
  platforms.push(platform(3460,285,165,{kind:'leaf',optional:true}),platform(3680,260,170,{kind:'cloud',optional:true}));
  sections=[{x:0,name:'Passinhos no jardim',hint:'Segure o pulo para subir mais. Solte para um pulinho.'},{x:1980,name:'Lago das folhas',hint:'As folhas passeiam. O cogumelo leva à touquinha!'},{x:4000,name:'Caminho das nuvens',hint:'Nuvens pontilhadas somem por um instante. Continue pulando!'}];
  width=6150;starIndices=[2,{i:7,dx:0,dy:-110},11,17,23];goalIndex=27;bow={x:3730,y:207,taken:false};
 }else{
  ({platforms,sections,width,starIndices,goalIndex,bow,winds,bells}=buildWorld(level,platform));
 }

 const goalPlatform=platforms[goalIndex];
 return {winds,bells,bridgeTimers:[0,0,0],level,name:names[level],width,sections,activeSection:0,time:0,platforms,player:{x:70,y:466,w:48,h:64,vx:0,vy:0,grounded:true,face:1,coyote:0.12,buffer:0,support:0,jumpHeld:false,jumpCut:false,springFlight:false,gliding:false,landTimer:0},checkpoint:0,stars:starIndices.map(v=>typeof v==='number'?{i:v,dx:0,dy:0}:v).map(({i,dx,dy})=>({x:platforms[i].x+platforms[i].w/2+dx,y:platforms[i].baseY-55+dy,taken:false})),bow,goal:{x:goalPlatform.x+goalPlatform.w/2,y:goalPlatform.y,platform:goalIndex},rescues:0,complete:false,events:[]};
}
function step(s,input={},dt){
 if(s.complete)return;dt=Math.min(Math.max(dt,0),1/30);s.events=[];s.time+=dt;const p=s.player;
 for(let i=0;i<s.bridgeTimers.length;i++)s.bridgeTimers[i]=Math.max(0,s.bridgeTimers[i]-dt);
 for(const b of s.bells){const near=Math.hypot(p.x+p.w/2-b.x,p.y+p.h/2-b.y)<55;if(near&&!b.near){s.bridgeTimers[b.group]=b.duration;s.events.push('bell');}b.near=near;}
 p.landTimer=Math.max(0,p.landTimer-dt);
 for(let i=0;i<s.platforms.length;i++){
  const q=s.platforms[i],oldX=q.x,oldY=q.y;
  q.x=q.baseX+(q.moving?Math.sin(s.time*q.speed+q.phase)*q.ax:0);q.y=q.baseY+(q.moving?Math.sin(s.time*q.speed+q.phase)*q.ay:0);
  if(q.gone>0){q.gone=Math.max(0,q.gone-dt);if(q.gone===0)q.remaining=CRUMBLE;}
  if(p.grounded&&p.support===i&&q.kind==='bridge'&&s.bridgeTimers[q.group]<=0){p.grounded=false;p.support=-1;}
  if(p.grounded&&p.support===i){p.x+=q.x-oldX;p.y+=q.y-oldY;if(q.kind==='crumbly'){q.remaining=Math.max(0,q.remaining-dt);if(q.remaining===0){q.gone=REAPPEAR;p.grounded=false;p.support=-1;}}}
 }
 p.buffer=input.jump?0.14:Math.max(0,p.buffer-dt);p.coyote=p.grounded?0.12:Math.max(0,p.coyote-dt);
 const wasGrounded=p.grounded;
 p.jumpHeld=input.jumpHeld===undefined?true:!!input.jumpHeld;
 const direction=(input.right?1:0)-(input.left?1:0);p.vx=direction*275;if(direction)p.face=direction;
 if(p.buffer>0&&p.coyote>0){p.vy=-620;p.grounded=false;p.coyote=0;p.buffer=0;p.jumpCut=false;p.springFlight=false;p.gliding=false;s.events.push('jump');}
 if(!p.jumpHeld&&!p.jumpCut&&!p.springFlight&&p.vy<0){p.vy=Math.max(p.vy,-265);p.jumpCut=true;}
 p.gliding=s.level>0&&!p.grounded&&p.jumpHeld&&(p.vy>=0||p.gliding);
 const wind=p.gliding?s.winds.find(w=>p.x+p.w/2>w.x&&p.x+p.w/2<w.x+w.w&&p.y+p.h/2>w.y&&p.y+p.h/2<w.y+w.h):null;
 const oldBottom=p.y+p.h;p.x=Math.max(0,Math.min(s.width-p.w,p.x+p.vx*dt));p.vy+=1450*dt;if(p.gliding){p.vy=Math.min(p.vy,115);if(wind)p.vy=Math.max(-wind.lift,p.vy-2900*dt);}p.y+=p.vy*dt;p.grounded=false;p.support=-1;
 if(p.vy>=0){for(let i=0;i<s.platforms.length;i++){
  const q=s.platforms[i];if(q.gone>0||(q.kind==='bridge'&&s.bridgeTimers[q.group]<=0))continue;
  if(p.x+p.w-7>q.x&&p.x+7<q.x+q.w&&oldBottom<=q.y+3&&p.y+p.h>=q.y){
   p.y=q.y-p.h;p.vy=0;p.grounded=true;p.support=i;p.springFlight=false;p.gliding=false;
   if(!wasGrounded){p.landTimer=0.16;s.events.push('land');}
   if(q.checkpoint&&i!==s.checkpoint){s.checkpoint=i;s.events.push('checkpoint');}
   if(q.spring&&(s.level>0||(p.x+p.w-7>q.x+q.w/2-22&&p.x+7<q.x+q.w/2+22))){p.vy=-840;p.grounded=false;p.coyote=0;p.springFlight=true;p.jumpCut=false;s.events.push('spring');}break;
  }
 }}
 for(const star of s.stars)if(!star.taken&&Math.hypot(p.x+p.w/2-star.x,p.y+p.h/2-star.y)<49){star.taken=true;s.events.push('star');}
 if(!s.bow.taken&&Math.hypot(p.x+p.w/2-s.bow.x,p.y+p.h/2-s.bow.y)<48){s.bow.taken=true;s.events.push('bow');}
 if(p.y>(s.level===0?740:s.platforms[s.checkpoint].y+680)){s.lastFall={x:Math.round(p.x),y:p.y};for(const q of s.platforms){q.remaining=CRUMBLE;q.gone=0;}const q=s.platforms[s.checkpoint];Object.assign(p,{x:q.x+30,y:q.y-p.h,vx:0,vy:0,grounded:true,support:s.checkpoint,coyote:0.12,buffer:0,jumpCut:false,springFlight:false,gliding:false,landTimer:0.16});s.bridgeTimers.fill(0);for(const b of s.bells)b.near=false;s.rescues++;s.events.push('rescue');}
 let active=0;for(let i=1;i<s.sections.length;i++)if(p.x+p.w/2>=s.sections[i].x)active=i;if(active!==s.activeSection){s.activeSection=active;s.events.push('section');}
 if(p.grounded&&p.support===s.goal.platform&&p.x+p.w>s.goal.x-25){s.complete=true;s.events.push('win');}
}
const api={create,step,names};if(typeof module!=='undefined')module.exports=api;else root.SandubaEngine=api;
})(typeof window!=='undefined'?window:globalThis);
