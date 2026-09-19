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
 function node(id,dataset={}){return {id,dataset,hidden:false,disabled:false,style:{},textContent:'',innerHTML:'',attributes:{},classList:{add(){},remove(){},toggle(){}},firstElementChild:{style:{}},events:{},focus(){},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]},addEventListener(type,fn){this.events[type]=fn;},setPointerCapture(){},querySelectorAll(){return []}};}
 const document={getElementById(id){return nodes[id]??=node(id)},querySelectorAll(){return touches},querySelector(selector){return selector==='[data-key="jump"]'?touches[2]:null},addEventListener(type,fn){listeners[type]=fn},body:{dataset:{},classList:{add(){},remove(){}}}};
 let frame,state,t=0;
 const context={SandubaMusic:require('./music.js'),document,window:{AudioContext:FakeAudio},SandubaRenderer:()=>({ready:Promise.resolve(),resize(){},draw(){}}),SandubaEngine:{create(l){return state=engine.create(l)},step:engine.step,returnToItem:engine.returnToItem,names:engine.names},addEventListener(type,fn){listeners[type]=fn},requestAnimationFrame(fn){frame=fn},Math,JSON,console:{logs:[],info(...a){this.logs.push(a);}}};
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
 const h=harness();h.tick();finish(h);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');h.nodes.replay.onclick();assert.equal(h.state.level,0);assert.equal(h.state.complete,false);
 finish(h);h.nodes.continue.onclick();assert.equal(h.state.level,1);
});
test('locked cards stay focusable and explain the prerequisite',()=>{const h=harness();assert.equal(h.nodes['world-sky'].getAttribute?.('aria-disabled'),'true');h.nodes['world-sky'].onclick();assert.equal(h.state.level,0);assert.ok(h.nodes.toast.textContent.includes('Jardim'));});

test('celebration delays results and pauses its timer when focus is lost',()=>{
 const h=harness();h.tick();const s=h.state,q=s.platforms[s.goal.platform];s.item.taken=true;Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(2);
 assert.equal(s.complete,true);assert.equal(h.nodes.modal.hidden,true);assert.ok(s.endingTime>=0);
 h.tick(100);const at=s.endingTime;h.blur();h.tick(100);assert.equal(s.endingTime,at);
 h.nodes.continue.onclick();h.tick(540);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');
});
function finish(h){const s=h.state;s.item.taken=true;if(s.level===3)Object.assign(s.player,{x:s.goal.x-24,y:s.goal.y-32,vx:0,vy:0});else{const q=s.platforms[s.goal.platform];Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});}h.tick(540);}
test('progress is saved per world and shown on the home cards',()=>{
 const store=storage();const h=harness({store});h.tick();h.state.stars[0].taken=true;h.state.stars[1].taken=true;finish(h);
 assert.deepEqual(JSON.parse(store.getItem('sanduba-nas-nuvens')).worlds[0],{stars:2,item:true,complete:true});
 const again=harness({store});assert.ok(again.nodes['stars-0'].textContent.includes('Flor Dourada'));assert.equal(again.nodes['world-sky'].getAttribute('aria-disabled'),'false');
});
test('replaying with fewer stars never lowers the saved best',()=>{
 const store=storage({'sanduba-nas-nuvens':JSON.stringify({worlds:[{stars:4,bow:true}],sound:false})});const h=harness({store});h.tick();finish(h);
 assert.deepEqual(JSON.parse(store.getItem('sanduba-nas-nuvens')).worlds[0],{stars:4,item:true,complete:true});
});
test('progress saved before the rename is still read and migrates to the new key',()=>{
 const store=storage({'pudim-nas-nuvens':JSON.stringify({worlds:[{stars:3,bow:true}],sound:false})});const h=harness({store});h.tick();
 assert.ok(h.nodes['stars-0'].textContent.includes('Flor Dourada'));
 assert.equal(h.nodes['world-sky'].getAttribute('aria-disabled'),'false');
 finish(h);assert.deepEqual(JSON.parse(store.getItem('sanduba-nas-nuvens')).worlds[0],{stars:3,item:true,complete:true});
});
test('game runs when storage is unavailable',()=>{const h=harness({store:null});h.tick(5);assert.ok(h.state);finish(h);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');});
test('home sound button turns music on, persists, and is restored on the next visit',()=>{
 const store=storage();const h=harness({store});
 assert.equal(h.nodes['sound-home'].textContent,'♫ Ligar a música');
 h.nodes['sound-home'].onclick();
 assert.equal(h.nodes['sound-home'].textContent,'♪ Desligar a música');assert.equal(h.nodes.sound.textContent,'♪');
 assert.equal(JSON.parse(store.getItem('sanduba-nas-nuvens')).sound,true);
 const again=harness({store});again.tick(3);assert.equal(again.nodes.sound.textContent,'♪');
});
test('a fall marks the respawn moment so the renderer can fade Sanduba back in',()=>{
 const h=harness();h.tick();assert.equal(h.state.rescueAt,undefined);h.state.player.y=950;h.tick(2);
 assert.equal(h.state.rescues,1);assert.equal(typeof h.state.rescueAt,'number');
});
test('each fall logs world, section and position for the observation session',()=>{
 const h=harness();h.tick();h.state.player.x=700;h.state.player.y=950;h.tick(2);
 assert.equal(h.console.logs.length,1);assert.deepEqual(JSON.parse(JSON.stringify(h.console.logs[0])),['queda',{mundo:1,trecho:1,x:700}]);
});

test('special item names replace the nightcap and reset in each world',()=>{
 const h=harness();h.tick();h.state.item.taken=true;h.tick();assert.ok(h.nodes['item-status'].title.includes('Flor Dourada'));
 finish(h);assert.ok(h.nodes['modal-copy'].textContent.includes('Flor Dourada'));
 h.nodes.continue.onclick();assert.equal(h.state.item.taken,false);h.tick();assert.ok(h.nodes['item-status'].title.includes('Gota de Nuvem'));
});
test('missing item offers an accessible shortcut back before the detour',()=>{
 const h=harness(),s=h.state,q=s.platforms[s.goal.platform];
 Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(2);
 assert.equal(s.complete,false);assert.equal(h.nodes['return-item'].hidden,false);
 assert.ok(h.nodes['return-item'].textContent.includes('Flor Dourada'));
 h.nodes['return-item'].onclick();assert.ok(s.player.x<s.item.x);assert.equal(h.nodes['return-item'].hidden,true);
});
test('all four worlds unlock in order and the reef ends the adventure',()=>{
 const h=harness();h.tick();
 for(let level=0;level<3;level++){
  finish(h);
  assert.equal(h.nodes[['world-sky','world-night','world-ocean'][level]].getAttribute('aria-disabled'),'false');
  h.nodes.continue.onclick();assert.equal(h.state.level,level+1);
 }
 assert.ok(h.nodes['touch-tip'].innerHTML.includes('SUBIR'));
 finish(h);assert.equal(h.nodes['modal-title'].textContent,'A aventura brilhou, Sanduba!');
 assert.ok(h.nodes['modal-copy'].textContent.includes('Pérola-Coração'));
 h.nodes.continue.onclick();assert.equal(h.state.level,0);
});
test('reef movement and celebration freeze during pause',()=>{
 const seed={worlds:[{stars:0,item:true,complete:true},{stars:0,item:true,complete:true},{stars:0,item:true,complete:true}]};
 const h=harness({store:storage({'sanduba-nas-nuvens':JSON.stringify(seed)})});h.nodes['world-ocean'].onclick();
 h.key('keydown','ArrowRight');h.tick(20);h.nodes.pause.onclick();const x=h.state.player.x;h.tick(90);assert.equal(h.state.player.x,x);
 h.nodes.continue.onclick();h.tick(20);assert.ok(h.state.player.x>=x);
 h.state.item.taken=true;Object.assign(h.state.player,{x:h.state.goal.x-24,y:h.state.goal.y-32,vx:0,vy:0});h.tick(2);const at=h.state.endingTime;
 h.blur();h.tick(90);assert.equal(h.state.endingTime,at);
});
test('instructions name the shared arrow control for keyboard and touch',()=>{
 const seed={worlds:[0,1,2].map(()=>({stars:0,item:true,complete:true}))};
 const h=harness({store:storage({'sanduba-nas-nuvens':JSON.stringify(seed)})});
 h.nodes['world-sky'].onclick();h.tick();
 assert.ok(h.nodes.toast.textContent.includes('↑ (ou Espaço/W)'));
 assert.ok(h.nodes.mechanic.textContent.includes('↑ (ou Espaço/W)'));
 h.nodes.help.onclick();assert.ok(h.nodes['modal-copy'].textContent.includes('↑ (ou Espaço/W)'));
 assert.ok(h.nodes['modal-copy'].textContent.includes('pressione e solte rapidamente'));
 h.nodes.continue.onclick();h.nodes['world-ocean'].onclick();h.tick();
 assert.ok(h.nodes.toast.textContent.includes('↑ (ou Espaço/W)'));
 assert.ok(h.nodes.mechanic.textContent.includes('↑ (ou Espaço/W)'));
});
test('meeting an ocean animal returns to the buoy with a clear message',()=>{
 const seed={worlds:[0,1,2].map(()=>({stars:0,item:true,complete:true}))};
 const h=harness({store:storage({'sanduba-nas-nuvens':JSON.stringify(seed)})});h.nodes['world-ocean'].onclick();
 const s=h.state;s.player.x=s.checkpoints[1].x;s.player.y=s.checkpoints[1].y;h.tick();
 const a=s.animals[0];s.player.x=a.x-24;s.player.y=a.y-32;h.tick();
 assert.equal(s.player.x,s.checkpoints[1].x);
 assert.ok(h.nodes.toast.textContent.includes('boia'));
 assert.equal(h.console.logs.length,0);
});
