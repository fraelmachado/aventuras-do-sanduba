const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const engine=require('./engine.js');
function storage(seed={}){const m=new Map(Object.entries(seed));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
function FakeAudio(){
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
 return {currentTime:0,state:'running',destination:{},resume(){return Promise.resolve();},
  createGain(){return {gain:param(),connect(){},disconnect(){}};},
  createOscillator(){return {type:'',frequency:param(),connect(){},disconnect(){},start(){},stop(){},onended:null};}};
}
function harness({store=storage()}={}){
 const listeners={},nodes={},touches=['left','right','jump'].map((key)=>node('touch-'+key,{key}));
 function node(id,dataset={}){return {id,dataset,hidden:false,disabled:false,style:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},firstElementChild:{style:{}},events:{},focus(){},setAttribute(){},addEventListener(type,fn){this.events[type]=fn;},setPointerCapture(){},querySelectorAll(){return []}};}
 const document={getElementById(id){return nodes[id]??=node(id)},querySelectorAll(){return touches},addEventListener(type,fn){listeners[type]=fn},body:{dataset:{},classList:{add(){},remove(){}}}};
 let frame,state,t=0;
 const context={PudimMusic:require('./music.js'),document,window:{AudioContext:FakeAudio},PudimRenderer:()=>({ready:Promise.resolve(),resize(){},draw(){}}),PudimEngine:{create(l){return state=engine.create(l)},step:engine.step},addEventListener(type,fn){listeners[type]=fn},requestAnimationFrame(fn){frame=fn},Math,JSON,console:{logs:[],info(...a){this.logs.push(a);}}};
 if(store)context.localStorage=store;
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'game.js'),'utf8'),context);
 nodes.start.onclick();
 return {nodes,touches,store,console:context.console,get state(){return state},key(type,code){listeners[type]({code,preventDefault(){}})},blur(){listeners.blur()},tick(n=1){for(let i=0;i<n;i++)frame(t+=1000/120)}};
}
test('holding keyboard jump produces higher jump than a tap through actual UI handlers',()=>{
 function peak(hold){const h=harness();h.tick();h.key('keydown','Space');if(!hold)h.key('keyup','Space');let min=999;for(let i=0;i<120;i++){h.tick();min=Math.min(min,h.state.player.y);}return min;}
 assert.ok(peak(true)+60<peak(false));
});
test('quick touch press survives pointerup until physics tick',()=>{
 const h=harness();h.tick();const jump=h.touches[2];jump.events.pointerdown({pointerId:1,preventDefault(){}});jump.events.pointerup({pointerId:1});h.tick(3);assert.ok(h.state.player.vy<0);
});
test('releasing one input does not cancel another held direction',()=>{
 const h=harness();h.key('keydown','ArrowRight');h.key('keydown','KeyD');h.key('keyup','ArrowRight');h.tick(5);assert.equal(h.state.player.vx,275);
});
test('blur pauses and resume clears held input',()=>{
 const h=harness();h.key('keydown','ArrowRight');h.tick(5);h.blur();const x=h.state.player.x;h.tick(20);assert.equal(h.state.player.x,x);h.nodes.continue.onclick();h.tick(5);assert.equal(h.state.player.x,x);
});
test('victory opens result, replay resets current level and next advances',()=>{
 const h=harness();h.tick();const s=h.state,q=s.platforms[s.goal.platform];Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(540);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');h.nodes.replay.onclick();assert.equal(h.state.level,0);assert.equal(h.state.complete,false);
 Object.assign(h.state.player,{x:h.state.goal.x,y:q.y-64,grounded:true,support:h.state.goal.platform});h.tick(540);h.nodes.continue.onclick();assert.equal(h.state.level,1);
});
test('world cards open new adventures directly and show their control tips',()=>{const h=harness();h.nodes['world-sky'].onclick();assert.equal(h.state.level,1);assert.ok(h.nodes['touch-tip'].innerHTML.includes('PLANAR'));h.nodes['world-night'].onclick();assert.equal(h.state.level,2);const q=h.state.platforms[h.state.goal.platform];Object.assign(h.state.player,{x:h.state.goal.x,y:q.y-64,grounded:true,support:h.state.goal.platform});h.tick(540);assert.equal(h.nodes['modal-title'].textContent,'Bons sonhos, Pudim!');assert.ok(!h.nodes['modal-copy'].textContent.includes('NaN'));});

test('bedtime delays results and pauses its timer when focus is lost',()=>{
 const h=harness();h.tick();const s=h.state,q=s.platforms[s.goal.platform];Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(2);
 assert.equal(s.complete,true);assert.equal(h.nodes.modal.hidden,true);assert.ok(s.endingTime>=0);
 h.tick(100);const at=s.endingTime;h.blur();h.tick(100);assert.equal(s.endingTime,at);
 h.nodes.continue.onclick();h.tick(540);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');
});
function finish(h){const s=h.state,q=s.platforms[s.goal.platform];Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(540);}
test('progress is saved per world and shown on the home cards',()=>{
 const store=storage();const h=harness({store});h.tick();h.state.stars[0].taken=true;h.state.stars[1].taken=true;h.state.bow.taken=true;finish(h);
 assert.deepEqual(JSON.parse(store.getItem('pudim-nas-nuvens')).worlds[0],{stars:2,bow:true});
 const again=harness({store});assert.equal(again.nodes['stars-0'].textContent,'★★☆☆☆ · Touquinha');assert.equal(again.nodes['stars-1'].textContent,'');
});
test('replaying with fewer stars never lowers the saved best',()=>{
 const store=storage({'pudim-nas-nuvens':JSON.stringify({worlds:[{stars:4,bow:true}],sound:false})});const h=harness({store});h.tick();finish(h);
 assert.deepEqual(JSON.parse(store.getItem('pudim-nas-nuvens')).worlds[0],{stars:4,bow:true});
});
test('game runs when storage is unavailable',()=>{const h=harness({store:null});h.tick(5);assert.ok(h.state);finish(h);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');});
test('home sound button turns music on, persists, and is restored on the next visit',()=>{
 const store=storage();const h=harness({store});
 assert.equal(h.nodes['sound-home'].textContent,'♫ Ligar a música');
 h.nodes['sound-home'].onclick();
 assert.equal(h.nodes['sound-home'].textContent,'♪ Desligar a música');assert.equal(h.nodes.sound.textContent,'♪');
 assert.equal(JSON.parse(store.getItem('pudim-nas-nuvens')).sound,true);
 const again=harness({store});again.tick(3);assert.equal(again.nodes.sound.textContent,'♪');
});
test('a fall marks the respawn moment so the renderer can fade Pudim back in',()=>{
 const h=harness();h.tick();assert.equal(h.state.rescueAt,undefined);h.state.player.y=950;h.tick(2);
 assert.equal(h.state.rescues,1);assert.equal(typeof h.state.rescueAt,'number');
});
test('each fall logs world, section and position for the observation session',()=>{
 const h=harness();h.tick();h.state.player.x=700;h.state.player.y=950;h.tick(2);
 assert.equal(h.console.logs.length,1);assert.deepEqual(JSON.parse(JSON.stringify(h.console.logs[0])),['queda',{mundo:1,trecho:1,x:700}]);
});

test('nightcap messages replace the ribbon and wearing resets in each world',()=>{
 const h=harness();h.tick();h.state.bow.taken=true;h.tick();assert.equal(h.nodes['bow-status'].title,'Touquinha encontrada!');
 finish(h);assert.ok(h.nodes['modal-copy'].textContent.includes('touquinha encontrada'));
 h.nodes.continue.onclick();assert.equal(h.state.bow.taken,false);h.tick();assert.ok(h.nodes['bow-status'].title.includes('touquinha'));
});
