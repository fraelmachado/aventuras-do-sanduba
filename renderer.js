/* Illustrated Canvas renderer. Coordinates are logical world pixels. */
window.SandubaRenderer = function(canvas) {
  'use strict';
  const c = canvas.getContext('2d');
  let width = 1100, height = 650, camera = 0, cameraY = 0, sprite = null, flight = null;
  const garden = new Image(), sky = new Image(), night = new Image(), reef = new Image(), source = new Image(), flightSource = new Image(), swimSource = new Image(), swimKickSource = new Image();
  function keyImage(image) {
        // Runtime color key for the intentionally green game sprite atlas.
        const atlas = document.createElement('canvas');
        atlas.width = image.width; atlas.height = image.height;
        const a = atlas.getContext('2d', {willReadFrequently:true});
        a.drawImage(image, 0, 0);
        const pixels = a.getImageData(0, 0, atlas.width, atlas.height), d = pixels.data;
        for(let i=0; i<d.length; i+=4) {
          const excess = d[i+1] - Math.max(d[i],d[i+2]);
          if(excess > 75) d[i+3] = 0;
          else if(excess > 8) { d[i+3] = Math.round(255*(1-(excess-8)/67)); d[i+1] = Math.max(d[i],d[i+2]); }
        }
        a.putImageData(pixels,0,0); return atlas;
  }
  const ready = Promise.all([
    new Promise(resolve=>{swimSource.onload=resolve;swimSource.onerror=resolve;swimSource.src=SandubaAssets.swim;}),
    new Promise(resolve=>{swimKickSource.onload=resolve;swimKickSource.onerror=resolve;swimKickSource.src=SandubaAssets.swimKick;}),
    new Promise(resolve=>{flightSource.onload=()=>{flight=keyImage(flightSource);resolve();};flightSource.onerror=resolve;flightSource.src=SandubaAssets.flight;}),
    ...[[sky,SandubaAssets.sky],[night,SandubaAssets.night],[reef,SandubaAssets.reef]].map(([im,src])=>new Promise(resolve=>{im.onload=resolve;im.onerror=resolve;im.src=src;})),
    new Promise(resolve => { garden.onload = resolve; garden.onerror = resolve; garden.src = SandubaAssets.garden; }),
    new Promise(resolve => {
      source.onload = () => {
        sprite = keyImage(source); resolve();
      };
      source.onerror = resolve; source.src = SandubaAssets.pig;
    })
  ]);
  function ellipse(x,y,rx,ry,color,rotation=0) {
    c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill();
  }
  function round(x,y,w,h,r,color) {
    c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
  }
  function star(x,y,r,color,angle=0) {
    c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();
    for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;c.lineTo(Math.cos(a)*k,Math.sin(a)*k);}
    c.closePath();c.fill();c.restore();
  }
  function pig(x,feet,h,t,{walking=false,air=false,face=1,land=0,gliding=false}={}) {
    if(!sprite)return;
    const pose=air?3:walking?1+Math.floor(t*9)%2:0;
    const b=walking?Math.sin(t*18)*1.5:Math.sin(t*2.5)*1;
    const squash=Math.max(0,Math.min(1,land/.14));
    const w=h*.67*(1+squash*.12),hh=h*(1-squash*.10);
    c.save();c.translate(x,feet+b);c.scale(face,1);c.rotate(air?-.07:walking?Math.sin(t*9)*.025:0);
    // Atlas cells preserve soft fur edges; crop only the blank border.
    if(gliding && flight) {
      // One integrated pose: paw grips handle, shaft stays beside the face.
      // Anchor the body (not the canopy) to the same world feet and height.
      const size=hh/.59;
      c.drawImage(flight,-size*.43,-size*.915,size,size);
    } else c.drawImage(sprite,pose*384+2,215,380,584,-w/2,-hh,w,hh);
    c.restore();
  }
  function swimmer(x,y,t,face=1){
    if(!swimSource.complete||!swimSource.naturalWidth)return;
    const kick=Math.floor(t*4.4)%2===1&&swimKickSource.complete&&swimKickSource.naturalWidth;
    c.save();c.translate(x,y+Math.sin(t*5)*2);c.scale(face,1);c.rotate(Math.sin(t*4)*.035);
    c.drawImage(kick?swimKickSource:swimSource,-72,-48,144,96);c.restore();
  }
  function cloud(x,y,w,color='#fffdf1') {
    const g=c.createLinearGradient(0,y-12,0,y+35);g.addColorStop(0,color);g.addColorStop(1,'#b9cbd2');
    round(x,y,w,27,14,g);ellipse(x+w*.22,y+2,w*.22,16,g);ellipse(x+w*.5,y-1,w*.26,20,g);ellipse(x+w*.79,y+3,w*.2,15,g);
    round(x+12,y-1,w-24,3,2,'#ffffffbd');
  }
  function flower(x,y,size,petal) {
    c.strokeStyle='#607c41';c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-4,y-10*size,x,y-22*size);c.stroke();
    ellipse(x+4*size,y-7*size,5*size,2.4*size,'#70984d',-.5);
    for(let k=0;k<5;k++)ellipse(x+Math.cos(k*1.257)*5*size,y-22*size+Math.sin(k*1.257)*5*size,4*size,3*size,petal,k*1.257);
    ellipse(x,y-22*size,2.7*size,2.7*size,'#eebf55');
  }
  function background(level,t,home) {
    const picture=level===1?sky:level===2?night:level===3?reef:garden;
    if(picture.complete&&picture.naturalWidth) {
      const dw=Math.max(width+180,height*1.5),dh=dw/1.5;
      const drift=home?Math.sin(t*.05)*8:Math.sin(camera/2100)*65;
      c.drawImage(picture,(width-dw)/2-drift,(height-dh)*.35,dw,dh);
    } else {c.fillStyle='#d8e7c6';c.fillRect(0,0,width,height);}

    if(!home) {
      // Calm the distant painting so real platforms remain easy to identify.
      const mist=c.createLinearGradient(0,80,0,650);mist.addColorStop(0,'#f4f6db10');mist.addColorStop(.5,level===3?'#0b76961c':level===2?'#13194618':level===1?'#ebf3ff28':'#f3f6d352');mist.addColorStop(1,'#1e6b670a');c.fillStyle=mist;c.fillRect(0,0,width,height);
    }
    for(let i=0;i<32;i++) {
      const x=((i*137-camera*.15+t*(4+i%3))%(width+60)+width+60)%(width+60)-30;
      const y=80+(i*89)%510+Math.sin(t*.8+i)*14;
      if(level===3){c.strokeStyle='#d7fbff85';c.lineWidth=1.3;c.beginPath();c.arc(x,y,2+i%4,0,Math.PI*2);c.stroke();}
      else ellipse(x,y,i%4?1.4:2.4,i%4?1.4:2.4,level===2?'#fff1a277':'#fff9cf88');
    }
    for(let i=0;i<(level===0?4:0);i++) {
      const x=((i*337-camera*.35+t*13)%(width+180)+width+180)%(width+180)-90;
      const y=220+i*81+Math.sin(t+i)*16,wing=3+Math.abs(Math.sin(t*10+i))*5;
      ellipse(x-wing/2,y,wing,4,i%2?'#efb1a1bb':'#ffe4a6bb',.5);ellipse(x+wing/2,y,wing,4,i%2?'#efb1a1bb':'#ffe4a6bb',-.5);
    }
  }
  function island(q,x,y) {
    const g=c.createLinearGradient(0,y,0,y+75);g.addColorStop(0,'#917549');g.addColorStop(.6,'#806743');g.addColorStop(1,'#584e33');
    c.fillStyle=g;c.beginPath();c.moveTo(x+3,y+3);c.lineTo(x+q.w-3,y+3);c.quadraticCurveTo(x+q.w+5,y+49,x+q.w*.72,y+62);c.quadraticCurveTo(x+q.w*.5,y+90,x+q.w*.24,y+55);c.quadraticCurveTo(x-7,y+48,x+3,y+3);c.fill();
    c.save();c.clip();for(let i=0;i<q.w/7;i++){const xx=x+(i*47)%q.w,yy=y+14+(i*19)%58;ellipse(xx,yy,3+(i%4),2,'#c4a87355',i);}
    c.restore();
    c.strokeStyle='#685b38';c.lineWidth=2;for(let i=0;i<3;i++){const xx=x+q.w*(.25+i*.23);c.beginPath();c.moveTo(xx,y+42);c.bezierCurveTo(xx-14,y+65,xx+12,y+67,xx-4,y+86);c.stroke();}
    const grass=c.createLinearGradient(0,y-4,0,y+17);grass.addColorStop(0,'#cadb8c');grass.addColorStop(.4,'#82a359');grass.addColorStop(1,'#537b43');
    round(x-3,y-1,q.w+6,18,9,grass);
    for(let i=0;i<q.w/8;i++){const xx=x+i*8;c.strokeStyle=i%2?'#c2d782':'#709148';c.lineWidth=1.5;c.beginPath();c.moveTo(xx,y+4);c.lineTo(xx-2,y-3-i%4);c.lineTo(xx+2,y);c.stroke();}
    for(let i=0;i<Math.floor(q.w/45);i++)flower(x+18+i*43,y,.43+(i%2)*.1,i%3?'#fff2bf':'#eeaca8');
  }
  function leaf(q,x,y,t) {
    ellipse(x+q.w/2,y+35,q.w*.45,5,'#264a471d');
    const g=c.createLinearGradient(0,y-7,0,y+27);g.addColorStop(0,'#d3e497');g.addColorStop(.35,'#95b66a');g.addColorStop(1,'#487545');
    ellipse(x+q.w/2,y+10,q.w/2,18,g);
    c.strokeStyle='#e2edb1';c.lineWidth=2;c.beginPath();c.moveTo(x+6,y+2);c.quadraticCurveTo(x+q.w/2,y-5,x+q.w-6,y+2);c.stroke();
    c.strokeStyle='#5e8d4c';c.lineWidth=1.3;for(let i=1;i<7;i++){c.beginPath();c.moveTo(x+q.w/2,y+16);c.lineTo(x+q.w*i/7,y+1);c.stroke();}
    if(q.moving){c.fillStyle='#fbf4bf';c.font='14px Trebuchet MS';c.textAlign='center';c.fillText('↔',x+q.w/2,y+14);}
  }
  function flag(q,index,state,x,y,t) {
    if(!q.checkpoint)return;
    const active=state.checkpoint===index;
    c.strokeStyle='#826746';c.lineWidth=4;c.beginPath();c.moveTo(x+21,y);c.lineTo(x+21,y-55);c.stroke();
    c.fillStyle=active?'#daac59':'#ebdfc2';c.beginPath();c.moveTo(x+21,y-55);c.quadraticCurveTo(x+38,y-61+Math.sin(t*3)*3,x+57,y-49);c.lineTo(x+48,y-34);c.lineTo(x+21,y-37);c.fill();
    star(x+35,y-45,5,active?'#fff3b3':'#b6a480');if(active){c.shadowBlur=16;c.shadowColor='#ffe8a2';ellipse(x+21,y-57,3,3,'#fff2b8');c.shadowBlur=0;}
  }
  function platform(q,index,state,t) {
    const x=q.x-camera,y=q.y;if(x+q.w< -30||x>width+30)return;
    const gone=q.gone>0;
    c.save();
    if(gone)c.globalAlpha=.15;
    if(q.kind==='bridge') {
      const time=state.bridgeTimers[q.group],on=time>0;
      c.globalAlpha=on?(time<2?.7+Math.sin(t*12)*.25:1):.18;
      c.shadowColor='#ffdf85';c.shadowBlur=on?17:0;
      round(x,y,q.w,9,4,on?'#ffe4a1':'#dcd7e7');
      c.shadowBlur=0;c.strokeStyle='#fff2be';c.lineWidth=1;c.beginPath();
      for(let k=0;k<=q.w;k+=15)c.lineTo(x+k,y+12+Math.sin(k*.03)*5);c.stroke();
      for(let k=12;k<q.w;k+=28)star(x+k,y+7,6,'#fff0bf',.15);
    }
    else if(q.kind==='moon') {
      const g=c.createLinearGradient(0,y,0,y+45);g.addColorStop(0,'#d9d5f1');g.addColorStop(1,'#756c9b');
      round(x,y,q.w,33,16,g);round(x+7,y,q.w-14,4,2,'#f7ebc3');
      for(let k=18;k<q.w;k+=43)ellipse(x+k,y+18,6,4,'#5f5c8233');
    }
    else if(q.kind==='leaf')leaf(q,x,y,t);
    else if(q.kind==='cloud'||q.kind==='crumbly'||state.level>0&&!q.kind) {
      if(q.kind==='crumbly'&&!gone) {
        const remaining=q.remaining??.85;c.globalAlpha=.5+Math.min(1,remaining/.85)*.5;
        c.translate(Math.sin(t*45)*(remaining<.5?2:0),0);
      }
      cloud(x,y,q.w,q.kind==='crumbly'?'#fff0ce':'#f9ffff');
      if(q.kind==='crumbly') {
        c.setLineDash([4,5]);c.strokeStyle='#b68f62';c.lineWidth=1;c.beginPath();c.moveTo(x+12,y-4);c.lineTo(x+q.w-12,y-4);c.stroke();c.setLineDash([]);
        for(let i=0;i<3;i++)ellipse(x+q.w/2-10+i*10,y+13,2,2,'#b19375');
      }
    } else island(q,x,y);
    if(q.spring) {
      const mx=x+q.w/2;
      round(mx-10,y-27,20,31,7,'#e8d7ae');ellipse(mx,y-28,33,12,'#b86166');ellipse(mx-10,y-32,6,3,'#ffdec0');ellipse(mx+13,y-29,5,3,'#ffdec0');
      c.font='bold 13px Trebuchet MS';c.fillStyle='#fff0d2';c.textAlign='center';c.fillText('↑',mx,y-28);
    }
    flag(q,index,state,x,y,t);c.restore();
  }
  function heart(x,y,r,color){
    c.save();c.translate(x,y);c.scale(r/20,r/20);c.fillStyle=color;c.beginPath();c.moveTo(0,18);
    c.bezierCurveTo(-28,0,-20,-18,-8,-16);c.bezierCurveTo(-2,-16,0,-10,0,-10);
    c.bezierCurveTo(0,-10,2,-16,8,-16);c.bezierCurveTo(20,-18,28,0,0,18);c.fill();c.restore();
  }
  function arrival(x,y,level,t){
    c.save();c.translate(x,y);
    if(level===3){
      c.strokeStyle='#f69d91';c.lineWidth=20;c.lineCap='round';c.beginPath();c.moveTo(-65,30);c.bezierCurveTo(-85,-145,85,-145,65,30);c.stroke();
      c.strokeStyle='#ffd6ad';c.lineWidth=5;c.beginPath();c.moveTo(-65,30);c.bezierCurveTo(-85,-145,85,-145,65,30);c.stroke();
      for(let i=0;i<8;i++){const a=Math.PI+(i/7)*Math.PI,px=Math.cos(a)*72,py=-36+Math.sin(a)*78;ellipse(px,py,7+i%3*3,6,'#efb3a5');}
      heart(0,-68,14,'#fdf0c8');
    }else if(level===2){
      c.strokeStyle='#d5c9ee';c.lineWidth=14;c.beginPath();c.arc(0,-22,62,Math.PI,0);c.stroke();
      for(let i=0;i<7;i++)star(Math.cos(i*.52+Math.PI)*66,Math.sin(i*.52+Math.PI)*65-22,7,'#ffe5a0',t*.3);
      round(-60,-8,120,15,8,'#d8d3e8');
    }else if(level===1){
      cloud(-70,-17,140,'#fff9df');
      c.strokeStyle='#b6d1e1';c.lineWidth=9;c.beginPath();c.arc(0,-22,52,Math.PI,0);c.stroke();
      star(0,-88,12,'#ffe5a1',t*.2);
    }else{
      c.strokeStyle='#779363';c.lineWidth=10;c.beginPath();c.arc(0,-28,57,Math.PI,0);c.stroke();
      for(let i=0;i<7;i++)flower(-53+i*18,-69-Math.sin(i/6*Math.PI)*35,.52,i%2?'#f5c2be':'#ffe7a6');
      round(-59,-5,118,12,6,'#c9ab75');
    }
    c.restore();
  }
  function specialItem(item,level,t){
    const x=item.x-camera,y=item.y+Math.sin(t*3)*4;
    c.save();c.shadowColor=level===3?'#d2ffff':'#ffe8a6';c.shadowBlur=18;
    if(level===0){flower(x,y+21,.9,'#f6c851');star(x,y,8,'#fff0aa',t*.3);}
    else if(level===1){c.fillStyle='#e6f8ff';c.beginPath();c.moveTo(x,y-24);c.bezierCurveTo(x+25,y+6,x+13,y+19,x,y+20);c.bezierCurveTo(x-13,y+19,x-25,y+6,x,y-24);c.fill();ellipse(x-6,y+3,4,7,'#ffffffbb');}
    else if(level===2){ellipse(x,y,22,22,'#ffe9a9');ellipse(x+9,y-8,19,19,'#40446e');star(x+15,y+13,5,'#fff4c5',t*.3);}
    else{ellipse(x,y+12,27,15,'#da94aa');ellipse(x,y-2,21,21,'#fff6e5');heart(x,y-3,11,'#f2a4b3');}
    c.shadowBlur=0;c.restore();
  }
  function shell(x,y,t,color){
    c.save();c.translate(x-camera,y+Math.sin(t*3+x)*3);c.fillStyle=color;c.beginPath();c.arc(0,5,17,Math.PI,0);c.lineTo(13,13);c.quadraticCurveTo(0,21,-13,13);c.closePath();c.fill();
    c.strokeStyle='#fff8dc';c.lineWidth=2;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(0,15);c.lineTo(i*6,-9+Math.abs(i)*3);c.stroke();}c.restore();
  }
  function celebrate(state,t){
    const a=state.endingTime,p=state.player,x=state.goal.x-camera,y=state.goal.y;
    const k=Math.min(1,a/.6),px=(p.x+p.w/2-camera)*(1-k)+x*k;
    if(state.level===3)swimmer(px,y-29+Math.sin(a*10)*4,a,p.face);
    else pig(px,y-8-Math.max(0,Math.sin((a-.6)*13))*10,94,a,{air:a>.6,face:p.face});
    if(a>1.25){const rise=Math.min(1,(a-1.25)/1.3);c.globalAlpha=1-rise*.55;
      if(state.level===3){c.strokeStyle='#e6ffff';c.lineWidth=2;c.beginPath();c.arc(x+32,y-102-rise*90,29,0,Math.PI*2);c.stroke();}
      heart(x+32,y-102-rise*90,18+rise*5,'#f8a9bb');c.globalAlpha=1;
    }
  }
  function sign(x,y,text) {
    if(x-camera< -150||x-camera>width+150)return;
    c.font='bold 11px Trebuchet MS';const w=c.measureText(text).width+28;
    round(x-camera-w/2,y,w,30,9,'#fff9e8ed');c.fillStyle='#68563d';c.textAlign='center';c.fillText(text,x-camera,y+19);
  }
  function drawSea(state,t){
    const left=camera,right=camera+width;
    // The pale surface and sandy floor show the swimming bounds.
    c.fillStyle='#c5f7f780';c.fillRect(0,0,width,29);
    c.fillStyle='#f5d2a669';c.fillRect(0,620,width,30);
    c.strokeStyle='#e7ffff8e';c.lineWidth=3;c.beginPath();
    for(let x=0;x<=width;x+=12)c.lineTo(x,29+Math.sin(x*.025+t*2)*3);c.stroke();
    for(const w of state.currents){
      if(w.x+w.w<left||w.x>right)continue;const x=w.x-camera;
      const g=c.createLinearGradient(x,0,x+w.w,0);g.addColorStop(0,'#a5faff00');g.addColorStop(.5,'#c4ffff30');g.addColorStop(1,'#a5faff00');c.fillStyle=g;c.fillRect(x,w.y,w.w,w.h);
      c.strokeStyle='#ddffff87';c.lineWidth=1.8;
      for(let i=0;i<7;i++){const bx=x+25+i*(w.w-50)/6,by=w.y+((i*83-t*44)%w.h+w.h)%w.h;c.beginPath();c.arc(bx,by,5+i%3,0,Math.PI*2);c.stroke();}
    }
    for(const q of state.checkpoints){
      if(q.x<left-80||q.x>right+80)continue;const x=q.x-camera,active=state.checkpoint===state.checkpoints.indexOf(q);
      c.strokeStyle='#f8e9bc';c.lineWidth=3;c.beginPath();c.moveTo(x,612);c.lineTo(x,q.y+37);c.stroke();
      ellipse(x,q.y+37,21,16,active?'#ffe2a1':'#dfbfd0');
      star(x,q.y+34,7,active?'#fff9d5':'#f9e7ee',t*.2);
    }
    for(const a of state.animals){
      if(a.x<left-150||a.x>right+150)continue;
      const x=(a.liveX??a.x)-camera,y=a.liveY??a.y;
      if(a.kind==='fish'){
        c.save();c.translate(x,y);c.scale(Math.cos(t*a.speed+a.phase)>0?1:-1,1);
        ellipse(0,0,a.r*.8,a.r*.48,'#f4c6a5');
        c.fillStyle='#eaa99d';c.beginPath();c.moveTo(-a.r*.63,0);c.lineTo(-a.r*1.3,-a.r*.55);c.lineTo(-a.r*1.3,a.r*.55);c.closePath();c.fill();
        ellipse(a.r*.36,-a.r*.09,2.7,2.7,'#5e6471');c.restore();
      }else{
        c.fillStyle='#d9b8e9bb';c.beginPath();c.arc(x,y,24,Math.PI,0);c.lineTo(x+24,y+9);c.quadraticCurveTo(x,y+18,x-24,y+9);c.closePath();c.fill();
        c.strokeStyle='#ecdbf4bb';c.lineWidth=3;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(x+i*9,y+10);c.quadraticCurveTo(x+i*9+Math.sin(t*3+i)*6,y+28,x+i*9,y+39);c.stroke();}
      }
    }
  }
  function draw(state,mode,t,particles) {
    const home=!state||mode==='home';
    if(!home)camera=Math.max(0,Math.min(Math.max(0,(state.width||2440)-width),state.player.x-width*.32));else camera=0;
    background(state?.level||0,t,home);
    cameraY=!home&&state.level>0&&state.level<3?Math.min(0,state.player.y-290):0;
    if(home) {
      const mobile=width<800,x=mobile?width*.72:width*.74,feet=mobile?height*.92:height*.85,h=mobile?205:345;
      leaf({w:h*.86},x-h*.43,feet+5,t);pig(x,feet,h,t);
      star(x-h*.44,feet-h*.5,12,'#e7c477',.2);star(x+h*.43,feet-h*.65,8,'#ffedaa',-.2);return;
    }
    c.save();c.translate(0,-cameraY);
    for(const w of state.winds||[])drawWind(w,t,state.level);
    if(state.level===3)drawSea(state,t);
    state.platforms.forEach((q,i)=>platform(q,i,state,t));
    for(const b of state.bells||[])drawBell(b,state,t);
    for(const s of state.stars)if(!s.taken) {
      const x=s.x-camera,y=s.y+Math.sin(t*3+s.x)*4;
      if(x< -30||x>width+30)continue;
      if(state.level===3){shell(s.x,s.y,t,['#f3b5ae','#ffe0a6','#c7b9ec','#f6aaba','#f0d49a'][state.stars.indexOf(s)]);continue;}
      c.shadowColor='#ffe396';c.shadowBlur=18;star(x,y,17,'#ba813d',-.05);star(x,y-2,15,'#ffda78',-.05);c.shadowBlur=0;star(x-2,y-4,8,'#fff0b6',-.05);
      ellipse(x-6,y-8,2,2,'#fff9e8');
    }
    if(!state.item.taken)specialItem(state.item,state.level,t);
    arrival(state.goal.x-camera,state.goal.y,state.level,t);
    if(state.level===0) {
      sign(165,405,'Segure para um salto maior ↑');
      sign(2040,330,'As folhas levam você ↔');
      sign(4070,320,'Nuvem dourada? Não demore!');
    }
    const p=state.player;
    if(state.endingTime!==undefined)celebrate(state,t);else {
    // Fade back in after a rescue; physics already moved Sanduba to the flag.
    c.globalAlpha=state.rescueAt===undefined?1:Math.min(1,(t-state.rescueAt)/.55);
    if(state.level===3)swimmer(p.x+p.w/2-camera,p.y+p.h/2,state.time,p.face);
    else pig(p.x+p.w/2-camera,p.y+p.h,87,t,{walking:Math.abs(p.vx)>30&&p.grounded,air:!p.grounded,face:p.face,land:p.landTimer||0,gliding:p.gliding});
    c.globalAlpha=1;
    }
    for(const a of particles){c.globalAlpha=Math.max(0,a.life);star(a.x-camera,a.y,a.life*5,a.color,a.life*2);}c.globalAlpha=1;c.restore();
    if(state.complete&&state.level===3){
      for(let k=0;k<28;k++){const x=(k*97+t*8)%width,y=(k*61+t*24)%height;star(x,y,3+k%4,k%2?'#ffe1a0':'#dfb3db',t*.2);}
      c.font='italic 26px Georgia';c.textAlign='center';c.fillStyle='#fff1c8';c.fillText('Fim da aventura ♡',width/2,120);
    }
  }

  function drawWind(w,t,level){
    const x=w.x-camera;if(x+w.w<0||x>width)return;
    const g=c.createLinearGradient(x,0,x+w.w,0);g.addColorStop(0,'#ffffff00');g.addColorStop(.5,level===2?'#cdd8ff25':'#fff7d93b');g.addColorStop(1,'#ffffff00');
    c.fillStyle=g;c.fillRect(x,w.y,w.w,w.h);
    c.strokeStyle=level===2?'#d9daff7a':'#fff9ded9';c.lineWidth=1.5;
    for(let k=0;k<10;k++){const yy=w.y+((k*63-t*70)%w.h+w.h)%w.h,xx=x+w.w/2+Math.sin(k+t)*w.w*.22;
      c.beginPath();c.moveTo(xx-10,yy+9);c.quadraticCurveTo(xx+15,yy+3,xx,yy-15);c.moveTo(xx,yy-15);c.lineTo(xx-4,yy-8);c.moveTo(xx,yy-15);c.lineTo(xx+6,yy-10);c.stroke();}
  }
  function drawBell(b,state,t){
    const x=b.x-camera,y=b.y,on=state.bridgeTimers[b.group]>0;
    c.strokeStyle='#b9a0cd';c.lineWidth=3;c.beginPath();c.moveTo(x-16,y+48);c.lineTo(x-16,y-18);c.quadraticCurveTo(x-16,y-33,x,y-28);c.stroke();
    c.save();c.translate(x,y);c.rotate(on?Math.sin(t*7)*.1:Math.sin(t*2)*.03);c.shadowColor='#ffe5a0';c.shadowBlur=on?20:7;
    const g=c.createLinearGradient(-13,-15,14,17);g.addColorStop(0,'#fff1bd');g.addColorStop(.5,'#d5aa62');g.addColorStop(1,'#a17b4e');
    c.fillStyle=g;c.beginPath();c.moveTo(-17,13);c.quadraticCurveTo(-9,7,-10,-8);c.quadraticCurveTo(0,-25,10,-8);c.quadraticCurveTo(10,6,17,13);c.closePath();c.fill();ellipse(0,16,4,4,'#ffe6a5');c.shadowBlur=0;c.restore();
    c.font='11px Trebuchet MS';c.fillStyle='#fff1cc';c.textAlign='center';c.fillText(on?'♫':'Toque aqui',x,y-37);
  }

  function resize() {
    const r=canvas.getBoundingClientRect();height=650;width=Math.round(650*r.width/r.height);
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=height*dpr;c.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();return {draw,resize,ready};
};
