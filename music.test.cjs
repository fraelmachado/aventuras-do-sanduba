const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const file=require('node:path').join(__dirname,'music.js');
const Music=fs.existsSync(file)?require(file):null;
function context(){
 const voices=[];
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
 return {currentTime:0,destination:{},voices,createGain(){return {gain:param(),connect(){},disconnect(){}}},createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(t){this.startAt=t},stop(t){this.stopAt=t}};voices.push(o);return o;}};
}
test('four distinct, finite looping scores with gentle tempos',()=>{
 assert.ok(Music,'music module exists');
 assert.equal(Music.tracks.length,4);
 assert.equal(new Set(Music.tracks.map(x=>JSON.stringify(x.melody))).size,4);
 for(const t of Music.tracks){assert.ok(t.bpm>=50&&t.bpm<=85);assert.equal(t.melody.length,64);assert.ok(t.melody.every(n=>n===null||Number.isFinite(n)));}
});
test('silence before activation, no duplicate scheduling, immediate stop on pause/mute',()=>{
 assert.ok(Music);const c=context(),m=Music.create();m.sync(c,0,false);assert.equal(c.voices.length,0);
 m.sync(c,0,true);assert.ok(c.voices.length>0);const n=c.voices.length;
 m.sync(c,0,true);assert.equal(c.voices.length,n);
 c.currentTime=.1;m.sync(c,0,false);assert.ok(c.voices.every(v=>v.stopAt<=.15));
 m.sync(c,0,true);c.currentTime=.6;m.sync(c,0,true);assert.ok(c.voices.length>n);
});
test('world changes stop old voices and a long frame gap never bursts missed notes',()=>{
 assert.ok(Music);const c=context(),m=Music.create();m.sync(c,0,true);const old=c.voices.slice();c.currentTime=.2;m.sync(c,1,true);
 assert.ok(old.every(v=>v.stopAt<=.25));const n=c.voices.length;c.currentTime=50;m.sync(c,1,true);assert.ok(c.voices.length-n<=6);
});
