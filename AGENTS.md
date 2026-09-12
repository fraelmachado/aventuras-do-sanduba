# Contexto para agentes — Pudim nas Nuvens

## Comece aqui

- A raiz oficial é `/Users/fraelmachado/Projects/pudim-nas-nuvens`. Trabalhe nesta pasta, não nas antigas cópias em Documents/Codex.
- Leia `README.md`, este arquivo e o código relevante antes de alterar algo. Verifique alterações locais e eventuais instruções adicionais.
- Converse em português brasileiro. O usuário prefere execução direta dentro do escopo autorizado, sem pedidos repetidos de confirmação.
- O jogo foi criado para a filha de 10 anos do usuário e usa o porquinho de pelúcia **Pudim** como protagonista.

## Decisões aprovadas

- HTML5, CSS e JavaScript puros; Canvas e Web Audio. Sem framework, bibliotecas externas ou dependência de rede para jogar.
- Direção visual: livro infantil ilustrado, com personagem fofinho e próximo da pelúcia. Não substituir as artes por figuras geométricas simplificadas.
- Tentativas ilimitadas, checkpoints em bandeirinhas, estrelas e laço opcionais. Desafios devem exigir escolha e habilidade, sem punições excessivas.
- O usuário aprovou o Jardim dos Pulos. Preserve sua geometria e dificuldade ao trabalhar nas outras fases, salvo novo pedido explícito.
- Cada mundo deve ter identidade própria. Não repetir uma rota apenas trocando cores.
- Nuvens: guarda-chuva, vãos largos, correntes de ar e subida pelas ilhas.
- Estrelas: sinos por contato, pontes temporárias e combinação com o guarda-chuva até a caminha.
- Mesmos controles no teclado e no toque. Segurar Pular durante a queda abre o guarda-chuva nas fases 2 e 3; soltar fecha.
- Qualquer mundo pode ser escolhido pelos cartões da tela inicial.

## Arquitetura e regras de implementação

- `worlds.js` descreve fases 2/3; a fase 1 permanece em `engine.js`.
- `engine.js` é independente de DOM e expõe `create(level)` e `step(state,input,dt)` via CommonJS e navegador. Índices de mundo são 0, 1 e 2.
- `game.js` conecta a interface e usa atualização fixa de 1/120 s. `input.jump` é uma borda de pressão; `input.jumpHeld` é o estado sustentado. Não confundir os dois.
- Preserve a limpeza de teclas ao pausar/perder foco e a captura de ponteiros. Um toque rápido deve sobreviver até o próximo passo de física.
- `renderer.js` desenha sem controlar a física. A câmera vertical acompanha as fases novas; a física usa coordenadas do mundo, que podem ter Y negativo.
- A fase noturna usa `bridgeTimers` por grupo. Pontes apagadas não são sólidas. O sino toca ao entrar em sua área; afaste-se e retorne para reativar. Durações atuais: 7, 9 e 13 segundos. Os relógios param com a pausa.
- `assets.js` e `Pudim nas Nuvens.html` são gerados. Nunca trate esses arquivos grandes como fonte principal de edição; evite despejar base64 no contexto.
- Artes fonte e prompts estão em `assets/`. O sprite usa remoção de verde em runtime; preserve o contrato do atlas ou atualize o renderer junto.
- Depois de mudar o tamanho visível da área de jogo, redimensione o renderer. Isso inclui início/retorno ao menu, rotação e tela cheia.

## Fluxo para continuar

1. Entenda o pedido mais recente e inspecione somente os módulos envolvidos.
2. Para mudanças de comportamento, acrescente testes relevantes e execute-os. Não reescreva o jardim sem necessidade.
3. Execute `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs`.
4. Para mudanças visuais ou de controles, confira no navegador em computador e largura móvel; verifique console, menus e proporção do Canvas. Rotas automáticas não comprovam a qualidade da experiência.
5. Execute `python3 build.py`. Se for entregar o ZIP, execute `python3 build.py --zip ./Pudim-nas-Nuvens.zip`.
6. Teste o HTML independente final quando houver mudanças de empacotamento ou recursos.
7. Atualize README/AGENTS quando decisões, comandos, arquivos ou limitações mudarem. Relate o resultado sem inventar validações.

## Prévia e arquivos locais

- Servidor sugerido: `python3 -m http.server 8767 --bind 127.0.0.1`, executado nesta raiz.
- Abra `http://127.0.0.1:8767/index.html` para desenvolvimento. A porta não é garantida entre sessões; verifique antes de reutilizar.
- A antiga URL na porta 8765 apontava para a pasta anterior, já movida. Não presuma que seja a versão atual.
- Não dependa de servidores, variáveis de navegador ou arquivos temporários de outra sessão.
- Uma futura sessão pode exigir permissão de escrita para esta raiz; a localização desejada já foi explicitamente escolhida pelo usuário.
- Não publicar, migrar para framework ou criar integrações externas como parte de uma alteração local comum.

## Marco de retomada

As três fases estão implementadas, com seis imagens incorporadas, seleção direta dos mundos, áudio opcional, tela cheia e suporte a toque. Última suíte registrada: 47 testes passando. A revisão preservou os movimentos e checkpoints do jardim em comparação de 15.000 passos. Não há persistência de progresso entre aberturas nem hospedagem pública. Próximas melhorias dependem do feedback do usuário; não são trabalho previamente autorizado.


## Pose do guarda-chuva

Ao planar, `renderer.js` usa `assets/pudim-guarda-chuva.png`: uma pose integrada com a patinha segurando o cabo ao lado do rosto. Não sobreponha novamente um cabo à pose de salto. O fundo verde usa a mesma remoção de cor do atlas. A imagem inteira é dimensionada pela altura do corpo (`hh / 0.59`), com ancoragem horizontal 0.43 e vertical 0.915 para manter os pés alinhados. Ao trocar esta arte, confira escala, ancoragem, recorte e espelhamento nos dois sentidos. `build.py` incorpora a imagem como `PudimAssets.flight`.


### Continuidade de cor

O atlas `assets/pudim-poses.png` é a referência de cor da pelúcia: rosa claro quente, com realces creme e sombras suaves. A pose do guarda-chuva foi harmonizada com esse atlas, preservando duas pernas separadas e a patinha no cabo. Use o atlas como referência em futuras edições para evitar mudanças de rosa entre animações.


## Trilhas musicais

`music.js` contém três composições originais e um sequenciador Web Audio. `game.js` compartilha o AudioContext com efeitos e sincroniza a trilha com mundo, modo e mute. Manter silêncio inicial, pausa/ajuda/resultado/menu sem música e limpeza de vozes ao trocar mundo. Não criar temporizadores duplicados: o agendamento curto usa o loop existente. `build.py` incorpora também music.js antes de game.js. Testar com music.test.cjs além das suítes existentes.


## Descanso ao concluir cada fase

A vitória inicia o modo `ending` por 4,2 segundos antes do resultado. `state.endingTime` avança apenas nesse modo; pausa, perda de foco e ajuda congelam a sequência. A física já concluída permanece intacta. O renderer aproxima Pudim, faz a transição para `assets/pudim-dormindo.png`, desenha a coberta em primeiro plano e anima respiração e pequenos zês. O recorte da nova arte é calculado pelo alfa após remover o verde. A música acompanha o descanso e para no resultado. Repetir ou avançar cria um estado novo sem endingTime.


## Favicon

`favicon.ico` na raiz deriva de `assets/pudim.ico`. O index.html o referencia e build.py incorpora seu conteúdo no HTML offline. Ao substituir o ícone, manter ambas as cópias sincronizadas e regenerar o HTML.
