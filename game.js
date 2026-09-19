/* Input, sound and UI. Physics and illustration live in separate files. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const renderer = SandubaRenderer($('world'));
  const keys = {left:false,right:false,jump:false,jumpHeld:false};
  const held = new Map();
  const music = SandubaMusic.create();
  function syncMusic() { music.sync(audio,state?.level??0,!muted&&(mode==='playing'||mode==='ending')); }
  let pausedMode='playing';
  let state=null, mode='home', last=0, clock=0, accumulator=0;
  let muted=true, audio=null, toastUntil=0, modalAction=null, results=[], particles=[];
  const STORAGE='sanduba-nas-nuvens';
  const ITEM_NAMES=['Flor Dourada','Gota de Nuvem','Luazinha','Pérola-Coração'];
  const ITEM_ICONS=['✿','☁','☾','♡'];
  const CARD_IDS=['world-garden','world-sky','world-night','world-ocean'];
  // ponytail: lê a chave antiga como reserva para não perder o progresso de quem jogou antes do rename; o próximo save() já grava na chave nova. Remover quando ninguém mais tiver save antigo.
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem('pudim-nas-nuvens')||'{}');
      const worlds=Array.isArray(raw.worlds)?raw.worlds.slice(0,4).map(w=>w?{stars:Math.max(0,Math.min(5,Number(w.stars)||0)),item:!!(w.item||w.bow),complete:!!(w.complete||w.bow)}:null):[];
      return {worlds,sound:!!raw.sound};
    }catch{return {worlds:[],sound:false};}
  }
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}
  const saved=load();
  function unlocked(i){return i===0||!!saved.worlds[i-1]?.complete;}
  function cards(){
    for(let i=0;i<4;i++){
      const w=saved.worlds[i],card=$(CARD_IDS[i]),open=unlocked(i);
      $('stars-'+i).textContent=w?'★'.repeat(w.stars)+'☆'.repeat(5-w.stars)+(w.item?' · '+ITEM_NAMES[i]:'')+(w.complete?' · Concluído':''):'';
      const reason=open?'':`Conclua ${SandubaEngine.names[i-1]} com ${ITEM_NAMES[i-1]} para desbloquear.`;
      card.setAttribute('aria-disabled',String(!open));card.setAttribute('aria-label',`${SandubaEngine.names[i]}. ${reason||'Disponível.'}`);
      card.title=reason;card.classList.toggle('locked',!open);
    }
  }

  function ensureAudio() {
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume().catch(()=>{muted=true;syncMusic();});
  }
  function setSound(on,{silent=false}={}) {
    muted=!on;saved.sound=on;save();
    $('sound').textContent=on?'♪':'♫';$('sound-home').textContent=on?'♪ Desligar a música':'♫ Ligar a música';
    for(const b of [$('sound'),$('sound-home')]){b.setAttribute('aria-label',on?'Desativar som':'Ativar som');b.title=on?'Desativar som':'Ativar som';b.classList.toggle('enabled',on);}
    if(!silent)tone('star');syncMusic();
  }
  function tone(type) {
    if(muted || type==='land' || type==='section')return;
    try {
      ensureAudio();
      const notes = {win:[523,659,784,1047],star:[880,1175],item:[659,880,1047],spring:[330,660],bell:[659,880,1318],checkpoint:[523,784],rescue:[330,392],jump:[350]}[type]||[];
      notes.forEach((f,i)=>{
        const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.105;
        o.type='sine';o.frequency.setValueAtTime(f,at);
        if(type==='jump'||type==='spring')o.frequency.exponentialRampToValueAtTime(f*1.3,at+.12);
        g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.045,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+.24);
        o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.26);
      });
    }catch{muted=true;}
  }
  function notify(text,duration=4.5) {
    $('toast').textContent=text;$('toast').classList.add('show');toastUntil=clock+duration;
  }
  function syncKeys() {
    const values=[...held.values()];keys.left=values.includes('left');keys.right=values.includes('right');keys.jumpHeld=values.includes('jump');
  }
  function press(source,action) {
    if(mode!=='playing'||held.has(source))return;
    held.set(source,action);if(action==='jump')keys.jump=true;syncKeys();
  }
  function release(source) {held.delete(source);syncKeys();}
  function clearKeys() {held.clear();keys.left=keys.right=keys.jump=keys.jumpHeld=false;accumulator=0;syncMusic();}
  function hud() {
    if(!state)return;
    const section=state.sections?.[state.activeSection||0];
    $('level-number').textContent=`${['JARDIM','NUVENS','ESTRELAS','RECIFE'][state.level]} · TRECHO ${(state.activeSection||0)+1} / 3`;
    const lit=Math.max(...state.bridgeTimers);
    $('mechanic').textContent=state.level===3?'◌ Segure ↑ (ou Espaço/W) para subir · solte para descer':state.level===0?'':state.level===1?(state.player.gliding?'☂ Guarda-chuva aberto · solte para descer':'☂ Segure ↑ (ou Espaço/W) no ar para planar'):lit>0?`♫ Pontes acesas · ${lit.toFixed(1)} s`:'♫ Encoste no sininho para revelar a ponte';
    $('level-name').textContent=section?.name||state.name;
    $('counter').textContent=`${state.level===3?'◉':'★'} ${state.stars.filter(s=>s.taken).length} / 5`;
    $('item-status').textContent=ITEM_ICONS[state.level];
    $('item-status').classList.toggle('found',state.item.taken);
    $('item-status').title=state.item.taken?`${state.item.name} encontrada!`:`Encontre ${state.item.name} para concluir`;
    $('item-status').setAttribute('aria-label',$('item-status').title);
    $('return-item').hidden=!state.offeredReturn||state.item.taken;
    $('return-item').textContent=`↶ Voltar para buscar ${state.item.name}`;
    $('progress').firstElementChild.style.width=Math.min(100,state.player.x/(state.width||2440)*100)+'%';
  }
  function start(level=0) {
    state=SandubaEngine.create(level);document.body.dataset.world=String(level+1);mode='playing';clearKeys();particles=[];
    $('return-item').hidden=true;
    if(!muted)try{ensureAudio();}catch{muted=true;}
    $('home').hidden=true;$('modal').hidden=true;$('help').disabled=false;$('hud').hidden=false;$('touch').hidden=false;
    document.body.classList.add('playing');renderer.resize();hud();
    $('touch-tip').innerHTML=level===0?'TOQUE: SALTO CURTO<br>SEGURE: SALTO ALTO':level===3?'SEGURE: SUBIR<br>SOLTE: DESCER DEVAGAR':'SEGURE NO AR: PLANAR<br>SOLTE: DESCER';
    document.querySelector('[data-key="jump"]').textContent=level===3?'Subir ↑':'Pular ↑';
    notify(state.sections[0].hint,6);
    $('pause').focus({preventScroll:true});
  }
  function modal(title,copy,button,action,icon='☁',tag='UM RESPIRO NA AVENTURA') {
    $('modal-title').textContent=title;$('modal-copy').textContent=copy;$('continue').textContent=button;
    $('modal-icon').textContent=icon;$('modal-tag').textContent=tag;$('modal').hidden=false;
    $('help').disabled=true;$('replay').hidden=mode!=='result';modalAction=action;clearKeys();
    $('continue').focus({preventScroll:true});
  }
  function home() {
    mode='home';state=null;clearKeys();$('home').hidden=false;$('hud').hidden=true;$('modal').hidden=true;$('return-item').hidden=true;
    $('help').disabled=false;$('touch').hidden=true;$('toast').classList.remove('show');
    document.body.classList.remove('playing');renderer.resize();$('start').focus({preventScroll:true});
  }
  function pause() {
    if(mode!=='playing'&&mode!=='ending')return;pausedMode=mode;mode='paused';
    modal('Pausa para um abraço','Sanduba continua daqui quando você voltar.','Continuar a aventura',resume);
  }
  function resume() {
    mode=pausedMode;$('modal').hidden=true;$('help').disabled=false;clearKeys();$('pause').focus({preventScroll:true});
  }
  function complete() {
    mode='result';const n=state.stars.filter(s=>s.taken).length;
    results[state.level]={stars:n,item:true};
    const best=saved.worlds[state.level]||{stars:0,item:false,complete:false};
    saved.worlds[state.level]={stars:Math.max(best.stars,n),item:true,complete:true};save();cards();
    const end=state.level===3;
    modal(end?'A aventura brilhou, Sanduba!':state.level===0?'O jardim é seu!':state.level===1?'Que voo bonito!':'As estrelas são suas!',
      end?`Você encontrou a Pérola-Coração e atravessou o arco de coral!\n${results.reduce((a,r)=>a+(r?.stars||0),0)} colecionáveis nesta aventura.\nUm beijinho para guardar no coração. ♡`:
      `${n} de 5 ${state.level===3?'conchas':'estrelas'} · ${state.item.name} encontrada!\n${n===5?'Todas as descobertas desta fase são suas.':'Você pode voltar para descobrir outros caminhos.'}`,
      end?'Começar outra aventura':['Voar pelas nuvens →','Acender as estrelas →','Nadar no recife →'][state.level],()=>{if(end)results=[];start(end?0:state.level+1);},end?'♡':'✦',end?'FIM DA AVENTURA':'AVENTURA CONCLUÍDA');
  }
  function events() {
    for(const event of state.events) {
      tone(event);
      if(event==='bell')notify('As estrelas acenderam! Siga até a próxima ilha.',3);
      if(event==='rescue'){
        if(state.rescueReason!=='animal')console.info('queda',{mundo:state.level+1,trecho:state.activeSection+1,x:state.lastFall.x});
        state.rescueAt=clock;notify(state.level===3?state.rescueReason==='animal'?'Você encostou em um animal. De volta à última boia! ♡':'De volta à última boia. Você consegue! ♡':'De volta à bandeirinha. Você consegue! ♡',3);
        const p=state.player;
        for(let i=0;i<12;i++)particles.push({x:p.x+p.w/2+Math.cos(i*.52)*26,y:p.y+p.h/2+Math.sin(i*.52)*20,vx:Math.cos(i*.52)*30,vy:-25+Math.sin(i*.52)*20,life:.7,color:'#fffaf0'});
      }
      if(event==='checkpoint')notify(state.level===3?'Boia ativada! Agora você volta para cá.':'Bandeirinha acesa! Agora você volta para cá.',3);
      if(event==='section')notify(state.sections?.[state.activeSection]?.hint||'Um novo caminho!',5);
      if(event==='item')notify(`${state.item.name} encontrada! Agora siga até a chegada. ♡`);
      if(event==='needItem'){state.offeredReturn=true;notify(`A chegada espera por ${state.item.name}. Use “Voltar para buscar” se quiser!`,5);}
      if(['star','item','checkpoint','land','spring'].includes(event)) {
        const p=state.player,amount=event==='land'?5:14;
        for(let i=0;i<amount;i++)particles.push({x:p.x+p.w/2,y:p.y+(event==='land'?p.h:20),vx:Math.cos(i*2.4)*60,vy:Math.sin(i*2.4)*60-20,life:event==='land'?.4:1,color:event==='item'?'#c4a9e0':event==='land'?'#e3e0b8':'#f4d391'});
      }
      if(event==='win'){state.endingTime=0;mode='ending';clearKeys();notify('Um abraço e um beijinho para celebrar! ♡',4);}
    }
  }
  $('start').onclick=()=>{results=[];start();};
  $('world-garden').onclick=()=>{results=[];start(0);};
  for(let i=1;i<4;i++)$(CARD_IDS[i]).onclick=()=>{if(!unlocked(i)){notify($(CARD_IDS[i]).title,5);return;}results=[];start(i);};
  $('continue').onclick=()=>modalAction?.();$('home-button').onclick=home;$('pause').onclick=pause;
  $('replay').onclick=()=>start(state.level);
  $('return-item').onclick=()=>{
    if(!state||state.item.taken)return;
    if(SandubaEngine.returnToItem(state)){
      state.offeredReturn=false;state.rescueAt=clock;clearKeys();hud();notify(`De volta ao caminho de ${state.item.name}. Você consegue! ♡`,4);
      $('pause').focus({preventScroll:true});
    }
  };
  $('sound').onclick=$('sound-home').onclick=()=>setSound(muted);
  $('fullscreen').onclick=async()=>{
    try {if(document.fullscreenElement)await document.exitFullscreen();else if($('play-area').requestFullscreen)await $('play-area').requestFullscreen();else notify('Use o celular deitado para ampliar o cenário.');}
    catch {notify('Não foi possível ampliar. Você pode continuar aqui.');}
  };
  $('help').onclick=()=>{
    const previous=mode;mode='help';
    modal('Aprenda os pequenos truques',
      '← → ou A / D para se mover. ↑ (ou Espaço/W) para pular ou subir; na tela de toque, use o botão com ↑.\nJardim: pressione e solte rapidamente para um salto curto; segure para pular alto.\nNuvens e estrelas: segure ↑ (ou Espaço/W) no ar para abrir o guarda-chuva; solte para descer.\nNoite: encoste nos sininhos para acender pontes temporárias.\nRecife: segure ↑ (ou Espaço/W) para subir; solte para descer devagar. Encostar num animal leva você de volta à última boia.\nBandeirinhas e boias são pontos de retorno. Estrelas e conchas são opcionais. Encontre o item especial de cada mundo antes da chegada.',
      'Vamos lá!',()=>{mode=previous;$('modal').hidden=true;$('help').disabled=false;(mode==='home'?$('start'):$('pause')).focus({preventScroll:true});});
  };
  const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
  addEventListener('keydown',e=>{
    if(e.code==='Escape'){if(mode==='playing'||mode==='ending')pause();else if(mode==='paused')resume();return;}
    if(e.code==='Tab'&&!$('modal').hidden) {
      const buttons=[...$('modal').querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled);
      const first=buttons[0],last=buttons.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
    const action=mapping[e.code];if(action&&mode==='playing'){e.preventDefault();press(e.code,action);}
  });
  addEventListener('keyup',e=>release(e.code));
  for(const button of document.querySelectorAll('[data-key]')) {
    button.addEventListener('pointerdown',e=>{
      e.preventDefault();if(mode!=='playing')return;button.setPointerCapture(e.pointerId);press('pointer'+e.pointerId,button.dataset.key);
    });
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>release('pointer'+e.pointerId));
    button.addEventListener('contextmenu',e=>e.preventDefault());
  }
  addEventListener('blur',()=>{clearKeys();pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearKeys();pause();}});
  addEventListener('resize',renderer.resize);
  document.addEventListener('fullscreenchange',renderer.resize);
  function frame(now) {
    const dt=Math.min((now-last)/1000||0,.1);last=now;clock+=dt;
    if(mode==='playing') {
      accumulator+=dt;
      while(accumulator>=1/120&&mode==='playing') {
        SandubaEngine.step(state,keys,1/120);keys.jump=false;accumulator-=1/120;events();
      }
      hud();
    }
    if(mode==='ending'){state.endingTime+=dt;if(state.endingTime>=3)complete();}
    for(const a of particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=70*dt;a.life-=dt;}
    particles=particles.filter(a=>a.life>0);
    if(clock>toastUntil)$('toast').classList.remove('show');
    syncMusic();renderer.draw(state,mode,clock,particles);requestAnimationFrame(frame);
  }
  setSound(!!saved.sound,{silent:true});
  cards();
  $('start').disabled=true;$('start').textContent='Preparando o jardim…';
  renderer.ready.then(()=>{$('start').disabled=false;$('start').innerHTML='Entrar no jardim <span>→</span>';});
  requestAnimationFrame(frame);
})();
