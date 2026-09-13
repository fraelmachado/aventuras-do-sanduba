/* Original, offline lullabies. MIDI notes; null leaves room to breathe. */
(function(root){
 'use strict';
 const tracks=[
  {name:'Passeio entre flores',bpm:80,attack:.018,release:1.25,
   chords:[[48,52,55],[45,48,52],[53,57,60],[55,59,62]],
   melody:[72,null,76,79,76,null,74,null,72,76,79,null,81,79,76,null,69,null,72,76,72,null,71,null,69,72,76,null,74,72,69,null,77,null,76,72,74,null,77,null,81,79,77,null,76,74,72,null,74,null,79,77,76,null,74,null,71,74,79,null,76,74,72,null]},
  {name:'Valsa de algodão',bpm:66,attack:.16,release:2.6,
   chords:[[53,57,60],[48,52,55],[50,53,57],[46,50,53]],
   melody:[77,null,null,81,84,null,81,null,79,null,77,null,76,null,null,null,76,null,null,79,84,null,79,null,76,null,74,null,72,null,null,null,74,null,null,77,81,null,77,null,76,null,74,null,72,null,null,null,74,null,77,null,81,null,79,null,77,null,74,null,77,null,null,null]},
  {name:'Boa noite, Sanduba',bpm:54,attack:.06,release:2.3,
   chords:[[48,52,55],[53,57,60],[45,48,52],[55,59,62]],
   melody:[76,null,null,null,79,null,76,null,74,null,null,null,72,null,null,null,77,null,null,null,76,null,72,null,69,null,null,null,72,null,null,null,76,null,null,null,72,null,69,null,71,null,null,null,72,null,null,null,74,null,71,null,67,null,null,null,71,null,74,null,72,null,null,null]}
 ];
 const hz=n=>440*Math.pow(2,(n-69)/12);
 function create(){
  let ctx=null,level=-1,active=false,next=0,step=0;
  const voices=new Set();
  function stop(){
   for(const v of voices){v.g.gain.cancelScheduledValues(ctx.currentTime);v.g.gain.setValueAtTime(Math.max(.0001,v.g.gain.value),ctx.currentTime);v.g.gain.linearRampToValueAtTime(.0001,ctx.currentTime+.025);v.o.stop(ctx.currentTime+.03);}
   voices.clear();active=false;
  }
  function note(n,at,duration,volume,attack){
   const o=ctx.createOscillator(),g=ctx.createGain(),v={o,g};
   o.type='sine';o.frequency.setValueAtTime(hz(n),at);
   g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+attack);
   g.gain.exponentialRampToValueAtTime(.0001,at+duration);
   o.connect(g);g.connect(ctx.destination);voices.add(v);
   o.onended=()=>{voices.delete(v);o.disconnect();g.disconnect();};
   o.start(at);o.stop(at+duration+.02);
  }
  function sync(context,world,playing){
   if(!context)return;
   if(ctx!==context||level!==world){if(ctx)stop();ctx=context;level=world;step=0;}
   if(!playing){if(active)stop();return;}
   const t=tracks[level];if(!t)return;
   if(!active){active=true;next=ctx.currentTime+.04;}
   const beat=60/t.bpm,interval=beat/2;
   // Drop missed beats after a suspended tab instead of catching up audibly.
   if(next<ctx.currentTime-.2)next=ctx.currentTime+.04;
   while(next<ctx.currentTime+.18){
    const melody=t.melody[step%64];
    if(melody!==null)note(melody,next,t.release,.023,t.attack);
    if(step%8===0){
     const chord=t.chords[Math.floor(step/16)%4];
     for(const pitch of chord)note(pitch,next,beat*3.8,.008,.35);
    }
    step=(step+1)%64;next+=interval;
   }
  }
  return {sync};
 }
 const api={tracks,create};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.PudimMusic=api;
})(typeof window!=='undefined'?window:globalThis);
