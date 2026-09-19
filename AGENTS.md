# Contexto para agentes — As aventuras do Sanduba

## Antes de editar

- Trabalhe nesta raiz Git. Leia `README.md`, este arquivo, os módulos envolvidos e `git status` antes de alterar.
- Converse em português brasileiro. O usuário prefere execução direta no escopo autorizado.
- O jogo é para a filha de 10 anos do usuário e tem como protagonista o porquinho de pelúcia **Sanduba**. O título visível aprovado em 2026-09-19 é **As aventuras do Sanduba**. O nome técnico do arquivo offline e a chave de `localStorage` permanecem para preservar acessos e progresso.
- Preserve HTML5, CSS e JavaScript puros, Canvas, Web Audio e jogo offline. Não introduza framework, dependência de rede ou publicação sem pedido.
- Arte de livro infantil ilustrado, personagem fofinho e próximo da pelúcia. Não substitua as artes por figuras geométricas simplificadas. Não desenhe sombra oval abaixo do Sanduba.

## Quatro mundos

1. **Jardim dos Pulos:** aprovado pelo usuário. Preserve geometria e dificuldade, salvo pedido explícito. Saltos variáveis, folhas móveis, cogumelo de impulso e nuvens temporárias. A estrela elevada na plataforma 7 é a única alteração antiga aprovada à geometria.
2. **Nuvens de Algodão:** guarda-chuva, vãos largos, correntes ascendentes e subida pelas ilhas.
3. **Céu Estrelado:** sinos por contato, pontes temporárias e guarda-chuva. Os sinos podem ser reativados após afastar e retornar; pontes apagadas não são sólidas. Durações: 7, 9 e 13 segundos.
4. **Recife dos Abraços:** Recife das Bolhas, Bosque de Algas e Gruta da Pérola. Nado com resistência, correntes, cardumes e águas-vivas previsíveis, cinco conchas, Pérola-Coração e arco de coral. Snorkel desde o início; sem guarda-chuva, combate ou cronômetro de oxigênio.

Cada fase tem cinco colecionáveis comuns, um fora da rota principal, e um item especial obrigatório: Flor Dourada, Gota de Nuvem, Luazinha e Pérola-Coração. A chegada sem o item dá uma dica e um botão acessível para voltar a um ponto seguro antes do item, preservando coletas. Conclusão com item desbloqueia a próxima fase; só a primeira começa desbloqueada. Todos os cartões continuam visíveis e explicam o bloqueio a teclado, toque e leitor de tela. Tentativas ilimitadas e checkpoints; saídas dos limites retornam ao checkpoint. No recife, encostar em peixe ou água-viva retorna à última boia com breve invulnerabilidade, sem perder coletas. As correntes ascendentes devem permitir descer ao soltar o controle.

## Código e estado

- `worlds.js` descreve fases 2–4; fase 1 está em `engine.js`. `engine.js` não usa DOM e expõe `create(level)` e `step(state,input,dt)` via CommonJS e navegador. Índices de mundo: 0–3.
- `game.js` usa atualização fixa de 1/120 s. `input.jump` é a borda da pressão; `input.jumpHeld` é o estado sustentado. Preserve limpeza de teclas em pausa/perda de foco e captura de ponteiros. Um toque rápido deve sobreviver até o próximo passo de física.
- Segurar ↑ (ou Espaço/W) na queda abre o guarda-chuva nas fases 2–3; no recife, segurar sobe e soltar desce lentamente. Teclado e toque devem ser equivalentes; o botão de toque também mostra ↑.
- `renderer.js` não controla a física. A câmera vertical acompanha as fases 2–3; a fase 4 usa corredor aquático. Redimensione após início, retorno ao menu, rotação e tela cheia.
- `bridgeTimers` por grupo param com a pausa. `state.endingTime` só avança no modo `ending`; pausa, ajuda e perda de foco congelam a comemoração. Ao vencer, Sanduba aproxima, comemora com as patinhas e manda um beijinho que vira coração; no mar, numa bolha. Não reintroduza caminha, coberta, zês ou cena de dormir.
- `state.rescueAt` registra o `clock` do resgate para o fade de 0,55 s; `state.lastFall={x,y}` é gravado antes de reposicionar. `game.js` registra `console.info('queda',…)` apenas para quedas ou saídas da água, não para contato com animais.
- `starIndices` pode ser número ou `{i,dx,dy}`; centro em `platforms[i].x+w/2+dx`, `baseY-55+dy`; raio de coleta 49.
- `game.js` guarda `{worlds:[{stars,item,complete}|null,...], sound}` em `localStorage` sob `sanduba-nas-nuvens`, lendo `pudim-nas-nuvens` como reserva. `bow:true` legado migra para `item:true,complete:true`; não apague estrelas nem rebaixe melhores resultados ou desbloqueios. `load` e `save` devem tolerar ausência/falha de `localStorage`.
- `setSound(on,{silent})` sincroniza botões, salva a preferência e chama `syncMusic()`. `ensureAudio()` só dentro de gesto ou `start()`. Música silencia no menu, pausa, ajuda e resultado; a fase 4 tem sua composição original.
- `assets.js` e `Sanduba nas Nuvens.html` são gerados. Edite fontes e execute `build.py`. O HTML deve ficar abaixo de 4 MB. Não despeje base64 no contexto. O ZIP opcional tem só HTML e `LEIA-ME.md`.
- O atlas `assets/sanduba-poses.png` é referência de cor: rosa claro quente, realces creme e sombras suaves. A pose do guarda-chuva é integrada; não sobreponha cabo. Os dois quadros de nado têm alfa transparente, duas pernas separadas e alternam pelo tempo da física para congelar com a pausa. Peixe e água-viva têm PNGs transparentes próprios, em estilo de livro ilustrado; `build.py` os converte para WebP. `build.py` usa `cwebp`.
- A touquinha foi removida do jogo. `assets/touquinha.svg` e `assets/sanduba-dormindo.png` permanecem apenas como fontes históricas, não incorporadas. Os nomes internos `bow` ainda aparecem em descrições antigas e como alias/migração compatível; não os apresente ao jogador.

## Fluxo de conclusão

1. Para comportamento, acrescente testes relevantes. Execute `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs adventure.test.cjs renderer.test.cjs offline.test.cjs`.
2. Para arte/controles, confira no navegador em desktop e largura móvel, console, menus, proporção do Canvas, toque e som quando o ambiente permitir. Use recarga sem cache. Não trate rotas automáticas como prova da qualidade visual.
3. Execute `python3 build.py` e teste o HTML offline independente quando mudarem recursos ou empacotamento. Não gere ZIP sem pedido.
4. Atualize README/AGENTS se decisões, comandos ou limitações mudarem. Relate validações reais e limitações.
5. Faça commit local de cada mudança concluída com suíte verde. Só faça push quando pedirem. Remoto: `origin` no GitHub.

`input.test.cjs` executa `game.js` em outro realm de `vm`: normalize arrays/objetos antes de `assert.deepEqual` estrito. `docs/sessao-de-teste.md` contém roteiro de observação. `assets/referencia-pelucia.png` parece referência pessoal, não é usada no jogo nem no ZIP; não a mova nem apague sem decisão do usuário.
