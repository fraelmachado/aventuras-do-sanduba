const E=require('./engine.js');
function simulate(level,fps=60){
 const s=E.create(level);let at=0,flying=false;
 for(let f=0;f<fps*150&&!s.complete;f++){
  const p=s.player,q=s.platforms[at],n=s.platforms[at+1];if(!n)break;
  let right=false,left=false,jump=false;
  if(flying){right=p.x<n.x+30;left=p.x>n.x+45;if(p.grounded&&p.support===at+1){at++;flying=false;}}
  else{right=p.x<q.x+q.w-55;if(!right&&p.grounded){jump=true;flying=true;right=true;}}
  const over=p.x+30>=n.x&&p.x<n.x+n.w;
  E.step(s,{right,left,jump,jumpHeld:!(level===2&&at===6)&&(!over||p.y+p.h>n.y)},1/fps);
  if(s.rescues){throw Error(JSON.stringify({level,fps,at,x:p.x,y:p.y,t:s.time,timers:s.bridgeTimers}));}
 }
 return s;
}
module.exports=simulate;
