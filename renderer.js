/* Illustrated Canvas renderer. Coordinates are logical world pixels. */
window.PudimRenderer = function(canvas) {
  'use strict';
  const c = canvas.getContext('2d');
  let width = 1100, height = 650, camera = 0, cameraY = 0, sprite = null, flight = null, sleeping = null, sleepBounds = null;
  const garden = new Image(), sky = new Image(), night = new Image(), source = new Image(), flightSource = new Image(), sleepSource = new Image(), capSource = new Image();
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
    new Promise(resolve=>{capSource.onload=resolve;capSource.onerror=resolve;capSource.src=PudimAssets.cap;}),
    new Promise(resolve=>{sleepSource.onload=()=>{
      sleeping=keyImage(sleepSource);
      const d=sleeping.getContext('2d').getImageData(0,0,sleeping.width,sleeping.height).data;
      let l=sleeping.width,r=0,top=sleeping.height,b=0;
      for(let y=0;y<sleeping.height;y++)for(let x=0;x<sleeping.width;x++)if(d[(y*sleeping.width+x)*4+3]>100){l=Math.min(l,x);r=Math.max(r,x);top=Math.min(top,y);b=Math.max(b,y);}
      sleepBounds=[l,top,r-l+1,b-top+1];resolve();
    };sleepSource.onerror=resolve;sleepSource.src=PudimAssets.sleep;}),
    new Promise(resolve=>{flightSource.onload=()=>{flight=keyImage(flightSource);resolve();};flightSource.onerror=resolve;flightSource.src=PudimAssets.flight;}),
    ...[[sky,PudimAssets.sky],[night,PudimAssets.night]].map(([im,src])=>new Promise(resolve=>{im.onload=resolve;im.onerror=resolve;im.src=src;})),
    new Promise(resolve => { garden.onload = resolve; garden.onerror = resolve; garden.src = PudimAssets.garden; }),
    new Promise(resolve => {
      source.onload = () => {
        sprite = keyImage(source); resolve();
      };
      source.onerror = resolve; source.src = PudimAssets.pig;
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
  function nightcap(x,y,w=64,angle=0) {
    if(!capSource.complete||!capSource.naturalWidth)return;
    c.save();c.translate(x,y);c.rotate(angle);
    // Anchor the center of the knitted brim to the crown; leave both ears visible.
    c.drawImage(capSource,-w*49.5/120,-w*91/120,w,w*100/120);c.restore();
  }
  function pig(x,feet,h,t,{walking=false,air=false,face=1,hasBow=false,land=0,gliding=false}={}) {
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
    if(hasBow){
      nightcap(0,-hh*.88,h*.66);
      if(gliding&&flight){
        // Canopy passes in front of the tip of the cap, without covering the face.
        const size=hh/.59;c.save();c.beginPath();c.rect(-size*.43,-size*.915,size,size*.32);c.clip();
        c.drawImage(flight,-size*.43,-size*.915,size,size);c.restore();
      }
    }
    c.restore();
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
    const picture=level===1?sky:level===2?night:garden;
    if(picture.complete&&picture.naturalWidth) {
      const dw=Math.max(width+180,height*1.5),dh=dw/1.5;
      const drift=home?Math.sin(t*.05)*8:Math.sin(camera/2100)*65;
      c.drawImage(picture,(width-dw)/2-drift,(height-dh)*.35,dw,dh);
    } else {c.fillStyle='#d8e7c6';c.fillRect(0,0,width,height);}

    if(!home) {
      // Calm the distant painting so real platforms remain easy to identify.
      const mist=c.createLinearGradient(0,80,0,650);mist.addColorStop(0,'#f4f6db10');mist.addColorStop(.5,level===2?'#13194618':level===1?'#ebf3ff28':'#f3f6d352');mist.addColorStop(1,'#1e6b670a');c.fillStyle=mist;c.fillRect(0,0,width,height);
    }
    for(let i=0;i<32;i++) {
      const x=((i*137-camera*.15+t*(4+i%3))%(width+60)+width+60)%(width+60)-30;
      const y=80+(i*89)%510+Math.sin(t*.8+i)*14;
      ellipse(x,y,i%4?1.4:2.4,i%4?1.4:2.4,level===2?'#fff1a277':'#fff9cf88');
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
  function bed(x,y) {
    c.shadowColor='#3d392f33';c.shadowBlur=12;ellipse(x,y+6,60,9,'#52473122');c.shadowBlur=0;
    round(x-52,y-55,12,61,5,'#87613f');round(x+44,y-39,10,45,4,'#87613f');round(x-44,y-28,91,19,5,'#ba8e61');
    round(x-43,y-40,84,19,7,'#fff5d7');round(x-38,y-52,31,16,8,'#fff9e7');round(x-8,y-46,48,24,7,'#b87588');
    star(x+15,y-35,7,'#f8d99b');
  }
  function bedtime(state,t) {
    const a=state.endingTime, p=state.player, x=state.goal.x-camera, y=state.goal.y;
    const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
    const approach=ease(a/.8), settle=ease((a-.8)/1.1);
    const px=(p.x+p.w/2-camera)*(1-approach)+(x-18)*approach;
    if(settle<1||!sleeping){
      c.save();c.globalAlpha=1-settle;
      c.translate(px,y-approach*38);c.rotate(-settle*.8);
      pig(0,0,87*(1-settle*.22),t,{walking:a<.8,hasBow:state.bow.taken});c.restore();
    }
    if(sleeping&&settle>0){
      const h=84*sleepBounds[3]/sleepBounds[2], breath=Math.sin(a*2.4)*.55;
      c.save();c.globalAlpha=settle;c.drawImage(sleeping,...sleepBounds,x-42,y-40-h+breath,84,h-breath);
      if(state.bow.taken)nightcap(x-24,y-40-h*.73+breath,36,-.32);
      c.restore();
      // The blanket is in front of the body, while the head rests on the pillow.
      c.save();c.globalAlpha=settle;round(x-5,y-49+breath,46,23,7,'#b87588');star(x+15,y-38+breath,6,'#f8d99b');c.restore();
    }
    if(a>2){
      c.save();c.fillStyle='#fff4db';c.textAlign='center';
      for(let i=0;i<3;i++){const v=((a-2)*.4+i/3)%1;c.globalAlpha=Math.sin(v*Math.PI)*.8;c.font=`${10+v*6}px Georgia`;c.fillText('z',x-25+v*18,y-90-v*35);}
      c.restore();
    }
  }
  function sign(x,y,text) {
    if(x-camera< -150||x-camera>width+150)return;
    c.font='bold 11px Trebuchet MS';const w=c.measureText(text).width+28;
    round(x-camera-w/2,y,w,30,9,'#fff9e8ed');c.fillStyle='#68563d';c.textAlign='center';c.fillText(text,x-camera,y+19);
  }
  function draw(state,mode,t,particles) {
    const home=!state||mode==='home';
    if(!home)camera=Math.max(0,Math.min(Math.max(0,(state.width||2440)-width),state.player.x-width*.32));else camera=0;
    background(state?.level||0,t,home);
    cameraY=!home&&state.level>0?Math.min(0,state.player.y-290):0;
    if(home) {
      const mobile=width<800,x=mobile?width*.72:width*.74,feet=mobile?height*.92:height*.85,h=mobile?205:345;
      leaf({w:h*.86},x-h*.43,feet+5,t);pig(x,feet,h,t);
      star(x-h*.44,feet-h*.5,12,'#e7c477',.2);star(x+h*.43,feet-h*.65,8,'#ffedaa',-.2);return;
    }
    c.save();c.translate(0,-cameraY);
    for(const w of state.winds||[])drawWind(w,t,state.level);
    state.platforms.forEach((q,i)=>platform(q,i,state,t));
    for(const b of state.bells||[])drawBell(b,state,t);
    for(const s of state.stars)if(!s.taken) {
      const x=s.x-camera,y=s.y+Math.sin(t*3+s.x)*4;
      if(x< -30||x>width+30)continue;
      c.shadowColor='#ffe396';c.shadowBlur=18;star(x,y,17,'#ba813d',-.05);star(x,y-2,15,'#ffda78',-.05);c.shadowBlur=0;star(x-2,y-4,8,'#fff0b6',-.05);
      ellipse(x-6,y-8,2,2,'#fff9e8');
    }
    if(!state.bow.taken) {const b=state.bow;c.shadowColor='#dbc4f5';c.shadowBlur=15;nightcap(b.x-camera,b.y+17+Math.sin(t*3)*4,54);c.shadowBlur=0;}
    bed(state.goal.x-camera,state.goal.y);
    if(state.level===0) {
      sign(165,405,'Segure para um salto maior ↑');
      sign(2040,330,'As folhas levam você ↔');
      sign(4070,320,'Nuvem dourada? Não demore!');
    }
    const p=state.player;
    if(state.endingTime!==undefined)bedtime(state,t);else {
    // Fade back in after a rescue; physics already moved Sanduba to the flag.
    c.globalAlpha=state.rescueAt===undefined?1:Math.min(1,(t-state.rescueAt)/.55);
    pig(p.x+p.w/2-camera,p.y+p.h,87,t,{walking:Math.abs(p.vx)>30&&p.grounded,air:!p.grounded,face:p.face,hasBow:state.bow.taken,land:p.landTimer||0,gliding:p.gliding});
    c.globalAlpha=1;
    }
    for(const a of particles){c.globalAlpha=Math.max(0,a.life);star(a.x-camera,a.y,a.life*5,a.color,a.life*2);}c.globalAlpha=1;c.restore();
    if(state.complete&&state.level===2){
      for(let k=0;k<28;k++){const x=(k*97+t*8)%width,y=(k*61+t*24)%height;star(x,y,3+k%4,k%2?'#ffe1a0':'#dfb3db',t*.2);}
      c.font='italic 26px Georgia';c.textAlign='center';c.fillStyle='#fff1c8';c.fillText('Bons sonhos, Sanduba…',width/2,120);
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
