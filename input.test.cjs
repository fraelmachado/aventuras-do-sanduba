const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const engine=require('./engine.js');
function harness(){
 const listeners={},nodes={},touches=['left','right','jump'].map((key)=>node('touch-'+key,{key}));
 function node(id,dataset={}){return {id,dataset,hidden:false,disabled:false,style:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},firstElementChild:{style:{}},events:{},focus(){},setAttribute(){},addEventListener(type,fn){this.events[type]=fn;},setPointerCapture(){},querySelectorAll(){return []}};}
 const document={getElementById(id){return nodes[id]??=node(id)},querySelectorAll(){return touches},addEventListener(type,fn){listeners[type]=fn},body:{dataset:{},classList:{add(){},remove(){}}}};
 let frame,state,t=0;
 const context={PudimMusic:require('./music.js'),document,window:{},PudimRenderer:()=>({ready:Promise.resolve(),resize(){},draw(){}}),PudimEngine:{create(l){return state=engine.create(l)},step:engine.step},addEventListener(type,fn){listeners[type]=fn},requestAnimationFrame(fn){frame=fn},Math};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'game.js'),'utf8'),context);
 nodes.start.onclick();
 return {nodes,touches,get state(){return state},key(type,code){listeners[type]({code,preventDefault(){}})},blur(){listeners.blur()},tick(n=1){for(let i=0;i<n;i++)frame(t+=1000/120)}};
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
