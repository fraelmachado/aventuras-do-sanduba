# Melhorias do Pudim nas Nuvens — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o jogo leve de compartilhar, guardar as descobertas da criança entre sessões, tornar o som e os laços descobríveis e recompensadores, dar escolha na coleta de estrelas, suavizar a volta à bandeirinha e preparar uma sessão de observação com a criança.

**Architecture:** Tudo permanece HTML5/Canvas/Web Audio puros. `build.py` passa a converter as artes para WebP com `cwebp` e a empacotar só o jogável no ZIP. `game.js` ganha um único objeto `saved` persistido em `localStorage` (estrelas, laços e preferência de som) e passa informações visuais ao renderer via campos no `state` (`wornBows`, `rescueAt`) e um argumento extra em `draw`. `engine.js` e `worlds.js` aceitam estrelas com deslocamento em relação à plataforma. A física do jardim não muda.

**Tech Stack:** JavaScript puro (navegador + Node 22 `node:test`), Python 3, `cwebp` 1.6 (já instalado em `/opt/homebrew/bin/cwebp`).

**Spec:** seção "Especificação" abaixo (não existe documento separado; a especificação foi acordada em conversa em 2026-09-12).

## Global Constraints

- Raiz oficial: `/Users/fraelmachado/Projects/sanduba-nas-nuvens`. Trabalhar só nela.
- Sem framework, biblioteca externa, rede ou pacote npm. Node 22 e Python 3 apenas para desenvolvimento.
- Textos de interface em português brasileiro; identificadores e comentários de código em inglês, como o restante do código.
- Não alterar geometria nem dificuldade do Jardim dos Pulos. A única exceção aprovada neste plano é mover a posição de **uma** estrela por mundo (Tarefa 6); plataformas, ventos, sinos e checkpoints não mudam.
- `assets.js` e `Pudim nas Nuvens.html` são gerados por `build.py`. Nunca editar à mão; nunca imprimir seu conteúdo no terminal (são megabytes de base64).
- `input.jump` é borda de pressão; `input.jumpHeld` é estado sustentado. Não misturar.
- Suíte completa: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs`. Deve passar ao fim de cada tarefa.
- Após alterar qualquer fonte, executar `python3 build.py`. Só gerar ZIP na Tarefa 9.
- Mudanças visuais exigem conferência no navegador em largura de computador e de celular (DevTools, ~400 px). Comando: `python3 -m http.server 8767 --bind 127.0.0.1` na raiz e abrir `http://127.0.0.1:8767/index.html`.
- Ponytail: menor diff que funciona. Nenhuma abstração para um único uso.

---

## Especificação

Oito melhorias, em ordem de valor/esforço, acordadas com o usuário:

1. **Arquivo leve.** O HTML offline tem 18 MB porque os seis PNG de 1536×1024 pesam 2–3 MB cada. Converter no build para WebP: cenários com perda (q 82), sprites com fundo verde em alta qualidade (q 96 + `-sharp_yuv`) para não criar franjas no recorte de cor. Medições feitas: cenários somam ~700 KB, sprites ~930 KB. Meta: HTML final abaixo de 4 MB.
2. **ZIP limpo.** Hoje tem 41 MB e inclui o HTML gerado, `assets.js` e `assets/` (as mesmas imagens três vezes), além de `assets/referencia-pelucia.png`, que parece foto pessoal. O ZIP deve conter só `Pudim nas Nuvens.html` e `LEIA-ME.md`.
3. **Progresso salvo.** Guardar por mundo o melhor número de estrelas e se o laço foi encontrado, em `localStorage`. Mostrar nos cartões da tela inicial. Nunca rebaixar o melhor resultado. O jogo deve funcionar sem `localStorage`.
4. **Som descobrível.** Botão "♫ Ligar a música" na tela inicial, além do botão do HUD. Preferência salva junto com o progresso e restaurada na próxima abertura. O áudio só é criado dentro de um gesto do usuário.
5. **Laços como recompensa.** Cada mundo tem um laço de cor própria (rosa, azul, dourado). Pudim usa todos os laços já conquistados em qualquer mundo e na tela inicial. O laço do mundo atual entra assim que é pego.
6. **Estrelas com escolha.** Uma estrela por mundo sai do caminho principal: no jardim, uma estrela alta que só o salto segurado alcança; nas nuvens e na noite, uma estrela no alto de uma corrente de ar, que exige pairar com o guarda-chuva. As outras quatro continuam no caminho.
7. **Retorno suave.** Ao voltar à bandeirinha, Pudim reaparece com fade de ~0,55 s e uma nuvenzinha de partículas. A física não muda.
8. **Observar a criança.** Registrar no console cada queda (mundo, trecho, posição da queda) e deixar um roteiro curto de observação em `docs/sessao-de-teste.md`.

---

## Estrutura de arquivos

| Arquivo | Ação | Responsabilidade neste plano |
| --- | --- | --- |
| `.gitignore` | Criar | Ignorar `.DS_Store` e `*.zip`. |
| `build.py` | Modificar | Converter para WebP via `cwebp`; ZIP com dois arquivos; checagem de tamanho. |
| `index.html` | Modificar | Badge de estrelas em cada cartão; botão de som na tela inicial. |
| `style.css` | Modificar | Estilo do badge e do botão de som da tela inicial. |
| `game.js` | Modificar | `saved` + `load/save`, `cards()`, `setSound()`, `ensureAudio()`, `wornBows`, `rescueAt`, partículas e log de queda. |
| `renderer.js` | Modificar | Paletas de laço por mundo, `bows` em `pig()`, `homeBows` em `draw()`, fade de retorno. |
| `engine.js` | Modificar | Estrelas com deslocamento (`{i,dx,dy}`); `lastFall`; estrela alta do jardim. |
| `worlds.js` | Modificar | Estrelas de vento nas fases 2 e 3. |
| `engine.test.cjs` | Modificar | Teste de estrelas do jardim (4 no chão + 1 alta). |
| `worlds.test.cjs` | Modificar | Testes de estrela na corrente de ar. |
| `routes.cjs` | Não muda | — |
| `input.test.cjs` | Modificar | Harness com `localStorage`, `AudioContext` e `console` falsos; testes de progresso, som, laços, retorno e log. |
| `docs/sessao-de-teste.md` | Criar | Roteiro de observação. |
| `README.md`, `AGENTS.md`, `LEIA-ME.md` | Modificar | Registrar decisões e comandos novos. |

---

### Tarefa 0: Colocar a pasta sob controle de versão

A pasta não é um repositório git. Cada tarefa termina com um commit; sem git isso não é possível. Criar o repositório é reversível (basta apagar `.git/`) e não altera nenhum arquivo do jogo.

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Criar `.gitignore`**

```gitignore
.DS_Store
*.zip
```

- [ ] **Step 2: Inicializar e registrar a linha de base**

```bash
cd /Users/fraelmachado/Projects/sanduba-nas-nuvens
git init -b main
git add -A
git commit -m "chore: linha de base antes das melhorias de 2026-09-12"
```

Esperado: um commit contendo código, testes, `assets/`, `assets.js` e `Pudim nas Nuvens.html`. O ZIP e `.DS_Store` ficam de fora.

- [ ] **Step 3: Confirmar suíte verde na linha de base**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -8`
Esperado: `# pass 47`, `# fail 0`.

---

### Tarefa 1: Imagens em WebP no build (item 1)

**Files:**
- Modify: `build.py` (arquivo inteiro, 20 linhas)

**Interfaces:**
- Produces: `assets.js` continua definindo `window.PudimAssets` com as mesmas seis chaves (`garden`, `pig`, `sky`, `night`, `flight`, `sleep`), agora com `data:image/webp;base64,...`. O renderer não muda: `Image` e `drawImage` aceitam WebP em todos os navegadores atuais (Safari desde 14).

- [ ] **Step 1: Escrever a checagem que falha**

A checagem é o próprio `build.py`: ele passa a abortar se o HTML final passar de 4 MB. Antes da mudança, o HTML tem 18 MB, então a checagem falha. Registrar o tamanho atual:

Run: `stat -f %z "Pudim nas Nuvens.html"`
Esperado: `18393805` (ou próximo).

- [ ] **Step 2: Reescrever `build.py`**

```python
"""Rebuild the offline HTML and optionally a ZIP: python3 build.py --zip /path/game.zip"""
from pathlib import Path
import argparse, base64, json, shutil, subprocess, tempfile, zipfile
root=Path(__file__).resolve().parent
args=argparse.ArgumentParser();args.add_argument('--zip');opt=args.parse_args()
if not shutil.which('cwebp'):raise SystemExit('cwebp não encontrado. Instale com: brew install webp')
# Backgrounds tolerate lossy compression. Green-keyed sprites use high quality plus sharp_yuv
# so chroma bleed does not leave fringes after the runtime color key. 'lossless' is the escape hatch.
IMAGES=[('garden','jardim.png','82'),('sky','nuvens.png','82'),('night','noite.png','82'),
        ('pig','pudim-poses.png','96'),('flight','pudim-guarda-chuva.png','96'),('sleep','pudim-dormindo.png','96')]
def webp(name,quality):
 flags=['-lossless'] if quality=='lossless' else ['-q',quality,'-sharp_yuv']
 with tempfile.NamedTemporaryFile(suffix='.webp') as out:
  subprocess.run(['cwebp','-quiet','-metadata','none',*flags,str(root/'assets'/name),'-o',out.name],check=True)
  return 'data:image/webp;base64,'+base64.b64encode(Path(out.name).read_bytes()).decode()
assets={key:webp(name,quality) for key,name,quality in IMAGES}
(root/'assets.js').write_text('window.PudimAssets='+json.dumps(assets)+';\n')
page=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text()+'\n</style>')
for name in ['assets.js','renderer.js','worlds.js','engine.js','music.js','game.js']:
 page=page.replace(f'<script src="{name}"></script>','<script>\n'+(root/name).read_text()+'\n</script>')
favicon='data:image/x-icon;base64,'+base64.b64encode((root/'favicon.ico').read_bytes()).decode()
page=page.replace('href="favicon.ico"',f'href="{favicon}"')
assert '<script src=' not in page
target=root/'Pudim nas Nuvens.html';target.write_text(page)
size=target.stat().st_size
assert size<4_000_000,f'HTML offline com {size/1e6:.1f} MB; esperado abaixo de 4 MB'
print(f'HTML offline atualizado: {size/1e6:.1f} MB, seis imagens WebP incorporadas.')
if opt.zip:
 with zipfile.ZipFile(opt.zip,'w',zipfile.ZIP_DEFLATED) as z:
  for f in sorted(root.rglob('*')):
   if f.is_file() and f.name!='.DS_Store' and f.resolve()!=Path(opt.zip).resolve():z.write(f,'pudim-nas-nuvens/'+str(f.relative_to(root)))
```

O bloco do ZIP fica igual por enquanto; a Tarefa 2 o troca.

- [ ] **Step 3: Rodar o build**

Run: `python3 build.py`
Esperado: `HTML offline atualizado: 2.x MB, seis imagens WebP incorporadas.` Sem `AssertionError`.

- [ ] **Step 4: Conferir no navegador que o recorte de cor não deixou franjas**

```bash
python3 -m http.server 8767 --bind 127.0.0.1
```

Abrir `http://127.0.0.1:8767/index.html` e, com o console aberto, verificar:
- Tela inicial: Pudim grande sobre a folha, sem borda verde ou cinza ao redor do corpo.
- Jardim: parado, andando e pulando (as quatro poses do atlas).
- Nuvens: segurar Pular no ar e observar a pose do guarda-chuva, nos dois sentidos.
- Qualquer mundo: chegar à caminha e observar a pose dormindo durante os 4,2 s.
- Três cenários sem blocos ou faixas visíveis.

Se alguma pose mostrar franja verde, trocar a qualidade daquela imagem em `IMAGES` para `'lossless'` (por exemplo `('pig','pudim-poses.png','lossless')`), rodar `python3 build.py` de novo e conferir. O limite de 4 MB comporta os três sprites em lossless (3,7 MB) somente se os cenários ficarem com perda; se estourar, ajustar o limite para `6_000_000` e registrar no README.

Abrir também `Pudim nas Nuvens.html` diretamente (duplo clique) e confirmar que as imagens aparecem.

- [ ] **Step 5: Rodar a suíte e commitar**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3`
Esperado: `# pass 47`.

```bash
git add build.py assets.js "Pudim nas Nuvens.html"
git commit -m "build: incorporar imagens como WebP e limitar o HTML offline a 4 MB"
```

---

### Tarefa 2: ZIP só com o jogável (item 2)

**Files:**
- Modify: `build.py` (bloco final `if opt.zip:`)

- [ ] **Step 1: Ver o conteúdo atual do ZIP para saber o que muda**

Run: `unzip -l Pudim-nas-Nuvens.zip | tail -3`
Esperado: dezenas de arquivos, ~41 MB descompactados.

- [ ] **Step 2: Substituir o bloco do ZIP**

Trocar as três últimas linhas de `build.py` por:

```python
if opt.zip:
 # Only what someone needs to play. Sources, tests and reference art stay in the folder.
 with zipfile.ZipFile(opt.zip,'w',zipfile.ZIP_DEFLATED) as z:
  for name in ['Pudim nas Nuvens.html','LEIA-ME.md']:z.write(root/name,'Pudim nas Nuvens/'+name)
 print(f'ZIP gerado em {opt.zip} com {len(z.namelist())} arquivos.')
```

- [ ] **Step 3: Gerar e verificar**

Run: `python3 build.py --zip ./Pudim-nas-Nuvens.zip && unzip -l Pudim-nas-Nuvens.zip`
Esperado: exatamente duas entradas, `Pudim nas Nuvens/Pudim nas Nuvens.html` e `Pudim nas Nuvens/LEIA-ME.md`; total abaixo de 4 MB.

- [ ] **Step 4: Commitar**

```bash
git add build.py
git commit -m "build: ZIP contém apenas o HTML offline e o LEIA-ME"
```

Observação para o relatório final: `assets/referencia-pelucia.png` não é usada pelo jogo e agora não entra no ZIP. Não mover nem apagar esse arquivo sem o usuário decidir.

---

### Tarefa 3: Progresso salvo e mostrado nos cartões (item 3)

**Files:**
- Modify: `index.html` (os três botões em `#worlds`)
- Modify: `style.css` (uma regra nova)
- Modify: `game.js` (variáveis no topo, `complete()`, inicialização)
- Test: `input.test.cjs` (harness + 3 testes)

**Interfaces:**
- Produces: em `game.js`, objeto `saved` com formato `{worlds:[{stars:number,bow:boolean}|null, ...], sound:boolean}`, funções `load()`, `save()`, `cards()`; chave de `localStorage` `'pudim-nas-nuvens'`. Elementos `#stars-0`, `#stars-1`, `#stars-2`. As Tarefas 4 e 5 leem e gravam `saved`.
- O harness de `input.test.cjs` passa a aceitar `harness({store})`, onde `store` é o retorno de `storage(seed)` ou `null` para simular ausência de `localStorage`.

- [ ] **Step 1: Atualizar o harness de teste**

Em `input.test.cjs`, substituir a função `harness()` inteira por:

```js
function storage(seed={}){const m=new Map(Object.entries(seed));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
function harness({store=storage()}={}){
 const listeners={},nodes={},touches=['left','right','jump'].map((key)=>node('touch-'+key,{key}));
 function node(id,dataset={}){return {id,dataset,hidden:false,disabled:false,style:{},textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},firstElementChild:{style:{}},events:{},focus(){},setAttribute(){},addEventListener(type,fn){this.events[type]=fn;},setPointerCapture(){},querySelectorAll(){return []}};}
 const document={getElementById(id){return nodes[id]??=node(id)},querySelectorAll(){return touches},addEventListener(type,fn){listeners[type]=fn},body:{dataset:{},classList:{add(){},remove(){}}}};
 let frame,state,t=0;
 const context={PudimMusic:require('./music.js'),document,window:{},PudimRenderer:()=>({ready:Promise.resolve(),resize(){},draw(){}}),PudimEngine:{create(l){return state=engine.create(l)},step:engine.step},addEventListener(type,fn){listeners[type]=fn},requestAnimationFrame(fn){frame=fn},Math,JSON,console:{info(){}}};
 if(store)context.localStorage=store;
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'game.js'),'utf8'),context);
 nodes.start.onclick();
 return {nodes,touches,store,get state(){return state},key(type,code){listeners[type]({code,preventDefault(){}})},blur(){listeners.blur()},tick(n=1){for(let i=0;i<n;i++)frame(t+=1000/120)}};
}
```

Mudanças em relação ao harness atual: `storage()` novo, parâmetro `{store}`, `localStorage` no contexto quando houver `store`, `JSON` e `console` no contexto, `store` exposto no retorno.

- [ ] **Step 2: Escrever os testes que falham**

Acrescentar ao fim de `input.test.cjs`:

```js
function finish(h){const s=h.state,q=s.platforms[s.goal.platform];Object.assign(s.player,{x:s.goal.x,y:q.y-64,grounded:true,support:s.goal.platform});h.tick(540);}
test('progress is saved per world and shown on the home cards',()=>{
 const store=storage();const h=harness({store});h.tick();h.state.stars[0].taken=true;h.state.stars[1].taken=true;h.state.bow.taken=true;finish(h);
 assert.deepEqual(JSON.parse(store.getItem('pudim-nas-nuvens')).worlds[0],{stars:2,bow:true});
 const again=harness({store});assert.equal(again.nodes['stars-0'].textContent,'★★☆☆☆ ♧');assert.equal(again.nodes['stars-1'].textContent,'');
});
test('replaying with fewer stars never lowers the saved best',()=>{
 const store=storage({'pudim-nas-nuvens':JSON.stringify({worlds:[{stars:4,bow:true}],sound:false})});const h=harness({store});h.tick();finish(h);
 assert.deepEqual(JSON.parse(store.getItem('pudim-nas-nuvens')).worlds[0],{stars:4,bow:true});
});
test('game runs when storage is unavailable',()=>{const h=harness({store:null});h.tick(5);assert.ok(h.state);finish(h);assert.equal(h.nodes['modal-title'].textContent,'O jardim é seu!');});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `node --test input.test.cjs 2>&1 | grep -E "^not ok|^ok" `
Esperado: os três testes novos em `not ok` (o primeiro por `stars-0` vazio e `worlds[0]` indefinido). Os sete antigos continuam `ok`.

- [ ] **Step 4: Marcar os cartões no HTML**

Em `index.html`, dentro de cada botão de mundo, acrescentar um `<em>` após o `<small>`:

```html
 <button id="world-garden"><span class="world-num">01</span><span><strong>Jardim dos Pulos</strong><small>Saltos, folhas e descobertas</small><em class="world-stars" id="stars-0"></em></span><span class="world-art">✿</span></button>
 <button id="world-sky"><span class="world-num">02</span><span><strong>Nuvens de Algodão</strong><small>Abra as asas do guarda-chuva</small><em class="world-stars" id="stars-1"></em></span><span class="world-art">☂</span></button>
 <button id="world-night"><span class="world-num">03</span><span><strong>Céu Estrelado</strong><small>Acenda o caminho de casa</small><em class="world-stars" id="stars-2"></em></span><span class="world-art">☾</span></button>
```

- [ ] **Step 5: Estilo do badge**

Em `style.css`, logo após a regra `.worlds small{...}` (a primeira ocorrência, fora das media queries):

```css
.world-stars{display:block;margin-top:6px;font-size:11px;letter-spacing:2px;color:#c9a35a;font-style:normal;min-height:1em}
```

- [ ] **Step 6: Implementar em `game.js`**

Logo após `let muted=true, audio=null, ...;` no topo do IIFE, acrescentar:

```js
  const STORAGE='pudim-nas-nuvens';
  function load(){try{return {worlds:[],sound:false,...JSON.parse(localStorage.getItem(STORAGE)||'{}')};}catch{return {worlds:[],sound:false};}}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch{}}
  const saved=load();
  function cards(){for(let i=0;i<3;i++){const w=saved.worlds[i];$('stars-'+i).textContent=w?'★'.repeat(w.stars)+'☆'.repeat(5-w.stars)+(w.bow?' ♧':''):'';}}
```

Em `complete()`, após `results[state.level]={stars:n,bow:state.bow.taken};`, acrescentar:

```js
    const best=saved.worlds[state.level]||{stars:0,bow:false};
    saved.worlds[state.level]={stars:Math.max(best.stars,n),bow:best.bow||state.bow.taken};save();cards();
```

Antes de `$('start').disabled=true;` (perto do fim), acrescentar:

```js
  cards();
```

- [ ] **Step 7: Rodar a suíte inteira**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3`
Esperado: `# pass 50`, `# fail 0`.

- [ ] **Step 8: Conferir no navegador**

`python3 build.py`, servir, jogar o jardim até o fim com alguma estrela, recarregar a página: o cartão do jardim mostra `★★☆☆☆` (ou o que foi coletado). Testar também em largura de celular (~400 px): o badge deve caber abaixo do subtítulo, centralizado.

- [ ] **Step 9: Commitar**

```bash
git add index.html style.css game.js input.test.cjs assets.js "Pudim nas Nuvens.html"
git commit -m "feat: salvar melhor resultado por mundo e mostrar nos cartões"
```

---

### Tarefa 4: Som descobrível e lembrado (item 4)

**Files:**
- Modify: `index.html` (dentro de `.intro`)
- Modify: `style.css`
- Modify: `game.js` (`tone()`, novo `setSound()`, `ensureAudio()`, `start()`, handlers)
- Test: `input.test.cjs` (harness + 1 teste)

**Interfaces:**
- Consumes: `saved`, `save()` da Tarefa 3.
- Produces: `setSound(on:boolean)` e `ensureAudio()` em `game.js`; botão `#sound-home`. Harness ganha `window.AudioContext` falso.

- [ ] **Step 1: Dar um `AudioContext` falso ao harness**

Em `input.test.cjs`, antes da função `harness`, acrescentar:

```js
function FakeAudio(){
 const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
 return {currentTime:0,state:'running',destination:{},resume(){return Promise.resolve();},
  createGain(){return {gain:param(),connect(){},disconnect(){}};},
  createOscillator(){return {type:'',frequency:param(),connect(){},disconnect(){},start(){},stop(){},onended:null};}};
}
```

Na linha `const context={...,window:{},...}` do harness, trocar `window:{}` por `window:{AudioContext:FakeAudio}`.

Rodar `node --test input.test.cjs 2>&1 | tail -3` e confirmar que os 10 testes continuam passando (o falso só passa a ser usado quando o som liga).

- [ ] **Step 2: Escrever o teste que falha**

```js
test('home sound button turns music on, persists, and is restored on the next visit',()=>{
 const store=storage();const h=harness({store});
 assert.equal(h.nodes['sound-home'].textContent,'♫ Ligar a música');
 h.nodes['sound-home'].onclick();
 assert.equal(h.nodes['sound-home'].textContent,'♪ Desligar a música');assert.equal(h.nodes.sound.textContent,'♪');
 assert.equal(JSON.parse(store.getItem('pudim-nas-nuvens')).sound,true);
 const again=harness({store});again.tick(3);assert.equal(again.nodes.sound.textContent,'♪');
});
```

Run: `node --test input.test.cjs 2>&1 | grep "not ok"`
Esperado: falha em `sound-home` (textContent vazio; `onclick` indefinido).

- [ ] **Step 3: Botão na tela inicial**

Em `index.html`, dentro de `<div class="intro">`, logo após `<button id="start" class="primary">…</button>`:

```html
<button id="sound-home" class="secondary sound-home">♫ Ligar a música</button>
```

Em `style.css`, após a regra `.secondary{...}` (primeira ocorrência):

```css
.sound-home{margin:14px 0 0;color:#a8686b;font-weight:600}
.sound-home.enabled{color:#4e6740}
```

- [ ] **Step 4: Implementar em `game.js`**

Substituir o começo de `tone()` para usar `ensureAudio()` e declarar as duas funções novas. O trecho:

```js
  function tone(type) {
    if(muted || type==='land' || type==='section')return;
    try {
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{muted=true;syncMusic();});
```

vira:

```js
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
```

Em `start()`, após `state=PudimEngine.create(level);…clearKeys();particles=[];`, acrescentar (o clique no botão é o gesto que libera o áudio):

```js
    if(!muted)try{ensureAudio();}catch{muted=true;}
```

Substituir o handler antigo do botão de som:

```js
  $('sound').onclick=()=>{
    muted=!muted;$('sound').textContent=muted?'♫':'♪';
    $('sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');$('sound').title=muted?'Ativar som':'Desativar som';
    $('sound').classList.toggle('enabled',!muted);tone('star');syncMusic();
  };
```

por:

```js
  $('sound').onclick=$('sound-home').onclick=()=>setSound(muted);
```

Antes de `cards();` no fim do arquivo, acrescentar:

```js
  setSound(!!saved.sound,{silent:true});
```

- [ ] **Step 5: Rodar a suíte inteira**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3`
Esperado: `# pass 51`.

- [ ] **Step 6: Conferir no navegador**

`python3 build.py`, servir. Na tela inicial, clicar "♫ Ligar a música": toca um chime, o texto muda para "♪ Desligar a música". Entrar no jardim: a trilha "Passeio entre flores" começa. Recarregar a página: o botão já aparece como "♪ Desligar a música" e, ao entrar no jardim, a música toca sem clicar em nada mais. Conferir no Safari além do Chrome, se disponível: em ambos o áudio só deve começar depois de um clique.

- [ ] **Step 7: Commitar**

```bash
git add index.html style.css game.js input.test.cjs assets.js "Pudim nas Nuvens.html"
git commit -m "feat: botão de música na tela inicial e preferência de som lembrada"
```

---

### Tarefa 5: Laços de cada mundo como recompensa (item 5)

**Files:**
- Modify: `renderer.js` (`bow()`, `pig()`, `bedtime()`, desenho do laço no cenário, `draw()`)
- Modify: `game.js` (`start()`, `events()`, chamada de `draw`)
- Test: `input.test.cjs` (1 teste)

**Interfaces:**
- Consumes: `saved.worlds[i].bow` da Tarefa 3.
- Produces: `state.wornBows: number[]` (índices de mundo, ordenados por conquista), mantido por `game.js`. `renderer.draw(state,mode,t,particles,homeBows=[])`. `pig(..., {bows:number[]})` substitui a opção `hasBow`.

- [ ] **Step 1: Escrever o teste que falha**

```js
test('bows earned earlier are worn in every world and the new one joins them',()=>{
 const store=storage({'pudim-nas-nuvens':JSON.stringify({worlds:[{stars:5,bow:true}],sound:false})});const h=harness({store});
 h.nodes['world-sky'].onclick();assert.deepEqual(h.state.wornBows,[0]);
 Object.assign(h.state.player,{x:h.state.bow.x-24,y:h.state.bow.y-32,vy:0});h.tick(2);
 assert.equal(h.state.bow.taken,true);assert.deepEqual(h.state.wornBows,[0,1]);
});
```

Run: `node --test input.test.cjs 2>&1 | grep "not ok"`
Esperado: falha porque `wornBows` é `undefined`.

- [ ] **Step 2: Implementar em `game.js`**

Após a declaração de `cards()`, acrescentar:

```js
  const earned=()=>[0,1,2].filter(i=>saved.worlds[i]?.bow);
```

Em `start()`, imediatamente após `state=PudimEngine.create(level);`, acrescentar:

```js
state.wornBows=earned();
```

Em `events()`, trocar a linha `if(event==='bow')notify('O caminho secreto guardava o lacinho! ♡');` por:

```js
      if(event==='bow'){notify('O caminho secreto guardava o lacinho! ♡');if(!state.wornBows.includes(state.level))state.wornBows.push(state.level);}
```

Em `frame()`, trocar `renderer.draw(state,mode,clock,particles);` por:

```js
renderer.draw(state,mode,clock,particles,earned());
```

Run: `node --test input.test.cjs 2>&1 | tail -3` → `# pass 12` (o teste novo passa; o renderer ainda ignora o dado, o que é o próximo passo).

- [ ] **Step 3: Paletas e laço parametrizado no `renderer.js`**

Substituir a função `bow(x,y,s=1)` por:

```js
  // One palette per world: garden pink, sky blue, night gold. Order: left loop, right loop, two highlights, tail, knot.
  const BOWS=[['#995a78','#bd7090','#e3a3b8','#ecadc0','#b36785','#e8a3b3'],
              ['#4f7ba1','#6f9fc7','#b9d7ee','#c9e2f4','#5f8db5','#bcd9f0'],
              ['#a8802e','#d1a54a','#f3dc9a','#f8e7b0','#b98f3a','#f1d88f']];
  function bow(x,y,s=1,p=BOWS[0]) {
    c.save();c.translate(x,y);c.scale(s,s);
    ellipse(-10,0,12,9,p[0],-.4);ellipse(10,0,12,9,p[1],.4);
    ellipse(-11,-2,7,4,p[2],-.4);ellipse(10,-2,7,4,p[3],.4);
    c.fillStyle=p[4];c.beginPath();c.moveTo(-3,2);c.lineTo(-13,22);c.lineTo(-3,18);c.lineTo(0,23);c.lineTo(6,2);c.fill();
    ellipse(0,0,5,6,p[5]);c.restore();
  }
```

- [ ] **Step 4: `pig()` veste vários laços**

Na assinatura de `pig`, trocar `hasBow=false` por `bows=[]`. Trocar a linha `if(hasBow)bow(w*.25,-hh*.88,h/250);` por:

```js
    // Slots: right ear, left ear, collar. A bow per world earned.
    const slots=[[w*.25,-hh*.88],[-w*.27,-hh*.85],[w*.05,-hh*.46]];
    bows.forEach((world,k)=>{const [sx,sy]=slots[k]||slots[2];bow(sx,sy,h/250*(k?.85:1),BOWS[world]);});
```

- [ ] **Step 5: Atualizar as chamadas**

Em `bedtime()`: `pig(0,0,87*(1-settle*.22),t,{walking:a<.8,hasBow:state.bow.taken});` → `pig(0,0,87*(1-settle*.22),t,{walking:a<.8,bows:state.wornBows||[]});` e `if(state.bow.taken)bow(x-26,y-43-h*.65,.22);` → `if(state.bow.taken)bow(x-26,y-43-h*.65,.22,BOWS[state.level]);`.

Em `draw()`: o laço solto no cenário `bow(b.x-camera,b.y+Math.sin(t*3)*4,1);` → `bow(b.x-camera,b.y+Math.sin(t*3)*4,1,BOWS[state.level]);`. A chamada principal `pig(p.x+p.w/2-camera,p.y+p.h,87,t,{…,hasBow:state.bow.taken,…})` → substituir `hasBow:state.bow.taken` por `bows:state.wornBows||[]`.

Assinatura de `draw`: `function draw(state,mode,t,particles)` → `function draw(state,mode,t,particles,homeBows=[])`. Na tela inicial, `pig(x,feet,h,t);` → `pig(x,feet,h,t,{bows:homeBows});`.

Confirmar que não sobrou `hasBow`: `grep -n hasBow renderer.js game.js` deve não retornar nada.

- [ ] **Step 6: Rodar a suíte e conferir no navegador**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3` → `# pass 52`.

`python3 build.py`, servir. Conferir:
- O laço solto no jardim é rosa, nas nuvens é azul, na noite é dourado.
- Pegar o laço do jardim: Pudim passa a usá-lo na orelha direita. Voltar ao início: o Pudim grande da tela inicial usa o laço rosa.
- Com dois ou três laços salvos (pode forçar via console: `localStorage.setItem('pudim-nas-nuvens',JSON.stringify({worlds:[{stars:5,bow:true},{stars:5,bow:true},{stars:5,bow:true}],sound:false}))` e recarregar): os três laços aparecem sem cobrir o rosto. Ajustar os números de `slots` se algum ficar mal posicionado; anotar os valores finais no AGENTS.md na Tarefa 9.
- Pose do guarda-chuva e pose dormindo: os laços não flutuam fora do corpo. Se na pose de voo ficarem estranhos, é aceitável ocultá-los enquanto `gliding` (acrescentar `if(!gliding)` antes do `forEach`) e registrar.

- [ ] **Step 7: Commitar**

```bash
git add renderer.js game.js input.test.cjs assets.js "Pudim nas Nuvens.html"
git commit -m "feat: laço com cor por mundo, vestido em toda parte depois de conquistado"
```

---

### Tarefa 6: Uma estrela de escolha por mundo (item 6)

**Files:**
- Modify: `engine.js` (montagem de `stars`; `starIndices` do jardim)
- Modify: `worlds.js` (`starIndices` das fases 2 e 3)
- Modify: `engine.test.cjs` (teste `stars can each be collected…`)
- Modify: `worlds.test.cjs` (rota contínua espera 4 estrelas; 2 testes novos)

**Interfaces:**
- Produces: entradas de `starIndices` podem ser um número (comportamento atual) ou `{i,dx,dy}`: estrela em `platforms[i].x+w/2+dx`, `platforms[i].baseY-55+dy`.

Posições escolhidas (física: salto de 620 px/s e gravidade 1450 dão 132 px de altura; o toque cortado a 265 px/s dá 24 px):
- Jardim: estrela 7 → `{i:7,dx:0,dy:-110}`. Fica em (1622, 230), acima da plataforma 7 (topo em 395). Centro de Pudim parado: 363; no ápice do salto segurado: 230,5. Toque: 319. Raio de coleta 49.
- Nuvens: estrela 6 → `{i:6,dx:-185,dy:-125}`. Fica em (2250, 20), no centro da corrente de ar entre as plataformas 5 e 6 (x 2170–2330, y −50–520).
- Noite: estrela 11 → `{i:11,dx:-153,dy:-145}`. Fica em (3022, 200), no centro da corrente entre as plataformas 10 e 11 (x 2960–3085, y 130–600).

- [ ] **Step 1: Ajustar o teste do jardim para falhar com a nova regra**

Em `engine.test.cjs`, substituir o teste `stars can each be collected on their main route platform, only once` por:

```js
test('four ground stars collect once; the high star needs a held jump, a tap misses it',()=>{
 const s=E.create();const ground=s.stars.filter(star=>s.platforms.some(q=>star.y===q.baseY-55));assert.equal(ground.length,4);
 for(const star of ground){const i=s.platforms.findIndex(q=>star.x>=q.baseX&&star.x<=q.baseX+q.w&&star.y===q.baseY-55);place(s,i,star.x-24);tick(s);assert.ok(star.taken);tick(s);assert.ok(!s.events.includes('star'));}
 const high=s.stars.find(star=>!ground.includes(star));assert.ok(high);
 function reach(held){const r=E.create();place(r,7,high.x-24);for(let j=0;j<70;j++)tick(r,{jump:j===0,jumpHeld:held||j<2});return r.stars.some(st=>st.taken&&st.y===high.y);}
 assert.equal(reach(true),true);assert.equal(reach(false),false);
});
```

Em `worlds.test.cjs`, na linha da rota contínua, trocar `a.equal(s.stars.filter(x=>x.taken).length,5);` por `a.equal(s.stars.filter(x=>x.taken).length,4);` e acrescentar ao fim:

```js
for(const [level,from,wind] of [[1,5,3],[2,10,0]])test(`world ${level+1} hidden star is reached by hovering in the updraft, then the route continues`,()=>{
 const s=E.create(level),w=s.winds[wind],cx=w.x+w.w/2,star=s.stars.find(st=>st.x>w.x&&st.x<w.x+w.w&&st.y>w.y&&st.y<w.y+w.h);a.ok(star,'star sits inside the wind column');
 place(s,from);s.player.x=s.platforms[from].x+s.platforms[from].w-55;
 for(let f=0;f<900&&!star.taken;f++){const p=s.player,c=p.x+p.w/2;E.step(s,{right:c<cx-6,left:c>cx+6,jump:f===0,jumpHeld:true},1/60);}
 a.equal(star.taken,true);a.equal(s.rescues,0);
 const n=s.platforms[from+1],tx=n.x+n.w/2;let landed=false;
 for(let f=0;f<600&&!landed;f++){const p=s.player,c=p.x+p.w/2;E.step(s,{right:c<tx-6,left:c>tx+6,jumpHeld:true},1/60);if(p.grounded&&p.support===from+1)landed=true;}
 a.ok(landed,'can still land on the next platform after the detour');a.equal(s.rescues,0);
});
```

Run: `node --test engine.test.cjs worlds.test.cjs 2>&1 | grep "not ok"`
Esperado: o teste do jardim falha (`ground.length` é 5); os dois de vento falham (`star sits inside the wind column`); a rota contínua falha (5 ≠ 4).

- [ ] **Step 2: Engine aceita deslocamento**

Em `engine.js`, na linha de `return {…}` de `create`, trocar:

```js
stars:starIndices.map(i=>({x:platforms[i].x+platforms[i].w/2,y:platforms[i].baseY-55,taken:false}))
```

por:

```js
stars:starIndices.map(v=>typeof v==='number'?{i:v,dx:0,dy:0}:v).map(({i,dx,dy})=>({x:platforms[i].x+platforms[i].w/2+dx,y:platforms[i].baseY-55+dy,taken:false}))
```

Na fase 1 (bloco `if(level===0)`), trocar `starIndices=[2,7,11,17,23];` por `starIndices=[2,{i:7,dx:0,dy:-110},11,17,23];`.

- [ ] **Step 3: Fases 2 e 3**

Em `worlds.js`: fase 1 (nuvens) `starIndices=[1,3,6,10,13];` → `starIndices=[1,3,{i:6,dx:-185,dy:-125},10,13];`. Fase 2 (noite) `starIndices=[2,6,8,11,15];` → `starIndices=[2,6,8,{i:11,dx:-153,dy:-145},15];`.

- [ ] **Step 4: Rodar e ajustar se preciso**

Run: `node --test engine.test.cjs worlds.test.cjs 2>&1 | grep -E "^(not )?ok"`
Esperado: tudo `ok`.

Se um teste de vento falhar em `star.taken`, a estrela está alta demais: reduzir `dy` em passos de 20 (menos negativo) até passar, mantendo a estrela pelo menos 120 px acima do topo da plataforma seguinte para que a rota direta não a colete. Se a rota contínua ainda coletar 5, a estrela está baixa demais: aumentar o módulo de `dy` em 20. Registrar os valores finais no README na Tarefa 9.

- [ ] **Step 5: Suíte completa, build e conferência no navegador**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3` → `# pass 54`.

`python3 build.py`, servir. Jardim: a estrela alta acima da quarta plataforma do primeiro trecho é visível na tela sem rolar a câmera (a câmera é só horizontal no jardim; y=230 está dentro dos 650 px). Segurar Pular parado embaixo dela a coleta; um toque não. Nuvens e noite: as estrelas ficam visíveis dentro das setas de vento; a câmera vertical acompanha ao subir.

- [ ] **Step 6: Commitar**

```bash
git add engine.js worlds.js engine.test.cjs worlds.test.cjs assets.js "Pudim nas Nuvens.html"
git commit -m "feat: uma estrela por mundo fora do caminho, alcançada por salto alto ou corrente de ar"
```

---

### Tarefa 7: Retorno suave à bandeirinha (item 7)

**Files:**
- Modify: `game.js` (`events()`)
- Modify: `renderer.js` (`draw()`, desenho do Pudim)
- Test: `input.test.cjs` (1 teste)

**Interfaces:**
- Produces: `state.rescueAt: number` (valor de `clock` no momento do resgate), gravado por `game.js` e lido pelo renderer.

- [ ] **Step 1: Teste que falha**

```js
test('a fall marks the respawn moment so the renderer can fade Pudim back in',()=>{
 const h=harness();h.tick();assert.equal(h.state.rescueAt,undefined);h.state.player.y=950;h.tick(2);
 assert.equal(h.state.rescues,1);assert.equal(typeof h.state.rescueAt,'number');
});
```

Run: `node --test input.test.cjs 2>&1 | grep "not ok"` → falha em `typeof … 'number'`.

- [ ] **Step 2: `game.js` marca o momento e solta a nuvenzinha**

Em `events()`, trocar `if(event==='rescue')notify('De volta à bandeirinha. Você consegue! ♡',3);` por:

```js
      if(event==='rescue'){
        state.rescueAt=clock;notify('De volta à bandeirinha. Você consegue! ♡',3);
        const p=state.player;
        for(let i=0;i<12;i++)particles.push({x:p.x+p.w/2+Math.cos(i*.52)*26,y:p.y+p.h/2+Math.sin(i*.52)*20,vx:Math.cos(i*.52)*30,vy:-25+Math.sin(i*.52)*20,life:.7,color:'#fffaf0'});
      }
```

- [ ] **Step 3: Renderer aplica o fade**

Em `renderer.js`, `draw()`, o bloco:

```js
    if(state.endingTime!==undefined)bedtime(state,t);else {
    ellipse(p.x+p.w/2-camera,p.y+p.h+4,23,5,'#253f3824');
    pig(…);
    }
```

vira:

```js
    if(state.endingTime!==undefined)bedtime(state,t);else {
    // Fade back in after a rescue; physics already moved Pudim to the flag.
    c.globalAlpha=state.rescueAt===undefined?1:Math.min(1,(t-state.rescueAt)/.55);
    ellipse(p.x+p.w/2-camera,p.y+p.h+4,23,5,'#253f3824');
    pig(p.x+p.w/2-camera,p.y+p.h,87,t,{walking:Math.abs(p.vx)>30&&p.grounded,air:!p.grounded,face:p.face,bows:state.wornBows||[],land:p.landTimer||0,gliding:p.gliding});
    c.globalAlpha=1;
    }
```

- [ ] **Step 4: Suíte, build, navegador**

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3` → `# pass 55`.

`python3 build.py`, servir, cair de propósito no jardim: Pudim surge na bandeirinha em meio segundo, com partículas claras. Pausar logo após cair e retomar: nada trava.

- [ ] **Step 5: Commitar**

```bash
git add game.js renderer.js input.test.cjs assets.js "Pudim nas Nuvens.html"
git commit -m "feat: fade e nuvenzinha ao voltar para a bandeirinha"
```

---

### Tarefa 8: Registro de quedas e roteiro de observação (item 8)

**Files:**
- Modify: `engine.js` (bloco de resgate)
- Modify: `game.js` (`events()`, bloco `rescue`)
- Create: `docs/sessao-de-teste.md`
- Test: `engine.test.cjs` (1 assert), `input.test.cjs` (1 teste)

**Interfaces:**
- Produces: `state.lastFall={x,y}` com a posição de Pudim no instante da queda, gravado pelo engine antes de reposicioná-lo. `game.js` registra `console.info('queda', {mundo, trecho, x})`.

- [ ] **Step 1: Testes que falham**

Em `engine.test.cjs`, no teste `fall preserves collected stars and bow`, após `assert.equal(s.rescues,1);` acrescentar `assert.ok(s.lastFall.y>=950);assert.ok(s.lastFall.x>0);` (a gravidade move Pudim um pouco antes da checagem de queda, por isso `>=`).

Em `input.test.cjs`, trocar `console:{info(){}}` no harness por `console:{logs:[],info(...a){this.logs.push(a);}}` e expor no retorno: acrescentar `console:context.console` ao objeto retornado (`return {nodes,touches,store,console:context.console,…}`). Acrescentar o teste:

```js
test('each fall logs world, section and position for the observation session',()=>{
 const h=harness();h.tick();h.state.player.x=700;h.state.player.y=950;h.tick(2);
 assert.equal(h.console.logs.length,1);assert.deepEqual(h.console.logs[0],['queda',{mundo:1,trecho:1,x:700}]);
});
```

Run: `node --test engine.test.cjs input.test.cjs 2>&1 | grep "not ok"` → os dois falham.

- [ ] **Step 2: Engine grava a posição da queda**

Em `engine.js`, no bloco `if(p.y>(s.level===0?740:…)){…}`, inserir `s.lastFall={x:Math.round(p.x),y:p.y};` como primeira instrução dentro das chaves (antes do `for(const q of s.platforms)`).

- [ ] **Step 3: `game.js` registra**

Dentro do bloco `if(event==='rescue'){…}` da Tarefa 7, acrescentar como primeira linha:

```js
        console.info('queda',{mundo:state.level+1,trecho:state.activeSection+1,x:state.lastFall.x});
```

Run: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -3` → `# pass 56`.

- [ ] **Step 4: Roteiro de observação**

Criar `docs/sessao-de-teste.md`:

```markdown
# Sessão de teste com a criança

Objetivo: ver onde ela se diverte, onde trava e o que ignora. Não ensinar; só responder se ela perguntar.

## Antes
- Abrir `Pudim nas Nuvens.html` no computador ou servir a pasta e abrir no celular.
- Abrir o console do navegador (Chrome/Safari: Cmd+Option+J) e deixar em segundo plano. Cada queda aparece como `queda {mundo, trecho, x}`.
- Não ligar o som por ela: observar se ela descobre o botão.

## Durante (anotar)
| Momento | O que aconteceu | Reação dela |
| --- | --- | --- |
| Tela inicial | Leu os cartões? Escolheu qual mundo? Achou o botão de música? | |
| Jardim, trecho 1 | Entendeu toque × segurar? Tentou a estrela alta? | |
| Jardim, cogumelo | Achou o caminho do laço? | |
| Nuvens | Abriu o guarda-chuva sozinha? Usou a corrente de ar? Pairou pela estrela? | |
| Noite | Entendeu o sino? Esperou a ponte apagar alguma vez? | |
| Caminha | Assistiu o descanso ou clicou para pular? | |

## Depois
- Copiar as linhas `queda` do console e agrupar por mundo/trecho. Três ou mais quedas no mesmo `x` indicam um vão para revisar.
- Perguntar: qual parte foi a mais legal? Qual foi chata? O que ela queria que o Pudim fizesse?
- Registrar as respostas aqui e só então decidir mudanças de dificuldade.
```

- [ ] **Step 5: Build e commit**

```bash
python3 build.py
git add engine.js game.js engine.test.cjs input.test.cjs docs/sessao-de-teste.md assets.js "Pudim nas Nuvens.html"
git commit -m "feat: registrar quedas no console e roteiro de observação com a criança"
```

---

### Tarefa 9: Documentação, distribuição final e verificação completa

**Files:**
- Modify: `README.md`, `AGENTS.md`, `LEIA-ME.md`
- Regenerar: `assets.js`, `Pudim nas Nuvens.html`, `Pudim-nas-Nuvens.zip`

- [ ] **Step 1: README.md**

Atualizar estas seções:
- "Testar e gerar a distribuição": mencionar que `build.py` exige `cwebp` (`brew install webp`), converte as imagens para WebP e aborta acima de 4 MB; o ZIP contém apenas `Pudim nas Nuvens.html` e `LEIA-ME.md`. Trocar "47 testes passando" pelo número real da última execução.
- "Estado atual": progresso salvo em `localStorage` (melhor resultado por mundo e preferência de som); laços com cor por mundo vestidos após conquista; uma estrela de escolha por mundo (jardim: salto segurado; nuvens e noite: pairar na corrente de ar); fade ao voltar à bandeirinha; `console.info('queda', …)` para observação.
- "Estrutura": `docs/sessao-de-teste.md`, `.gitignore`.
- "Artes e limitações": `assets/referencia-pelucia.png` não entra no ZIP; a pasta é um repositório git local.

- [ ] **Step 2: AGENTS.md**

- "Decisões aprovadas": acrescentar as seis decisões acima em uma linha cada. Deixar explícito que a exceção ao jardim foi apenas a posição da estrela 7, sem mudança de plataformas.
- "Arquitetura e regras": `saved`/`load`/`save`/`cards`/`setSound`/`ensureAudio` em `game.js`; `state.wornBows`, `state.rescueAt`, `state.lastFall`; `renderer.draw` recebe `homeBows`; `pig()` usa `bows`, não `hasBow`; `starIndices` aceita `{i,dx,dy}`; paletas `BOWS` e `slots` no renderer (registrar os valores finais). `build.py` usa `cwebp`; `'lossless'` como escape para sprite com franja.
- "Fluxo para continuar": incluir `git commit` ao fim de cada mudança e o limite de 4 MB.
- "Marco de retomada": reescrever com o estado após este plano e o total de testes.

- [ ] **Step 3: LEIA-ME.md**

Acrescentar: o progresso fica salvo no navegador; o botão "♫ Ligar a música" na tela inicial; cada mundo tem uma estrela escondida que pede salto alto ou pairar no vento; os laços conquistados ficam com o Pudim. Trocar a linha de verificação para incluir `music.test.cjs`.

- [ ] **Step 4: Verificação final**

```bash
node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs 2>&1 | tail -8
python3 build.py --zip ./Pudim-nas-Nuvens.zip
unzip -l Pudim-nas-Nuvens.zip
stat -f %z "Pudim nas Nuvens.html"
```

Esperado: `# fail 0`; ZIP com duas entradas; HTML abaixo de 4 000 000 bytes.

Abrir `Pudim nas Nuvens.html` por duplo clique (sem servidor) e percorrer: tela inicial com badges e botão de música; jardim com estrela alta; laço rosa vestido após pegar; queda com fade; nuvens com estrela na corrente; noite; caminha. Repetir a tela inicial em largura de celular via DevTools e conferir que os cartões e o botão de música cabem.

- [ ] **Step 5: Commit final**

```bash
git add README.md AGENTS.md LEIA-ME.md assets.js "Pudim nas Nuvens.html"
git commit -m "docs: registrar melhorias de 2026-09-12 e novo fluxo de build"
```

Relatar ao usuário: tamanho final do HTML, conteúdo do ZIP, total de testes, e a pendência de decisão sobre `assets/referencia-pelucia.png`.
