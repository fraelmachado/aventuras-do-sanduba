# Pudim nas Nuvens

Jogo de plataforma para uma criança de 10 anos, inspirado em seu porquinho de pelúcia, chamado **Pudim**. Desenvolvido em HTML5, CSS e JavaScript puros, sem framework, bibliotecas externas ou serviços de rede.

## Pasta oficial

```text
/Users/fraelmachado/Projects/pudim-nas-nuvens
```

Abra essa pasta como projeto na próxima sessão. O arquivo `AGENTS.md` registra as decisões e orientações para continuar o desenvolvimento. Esta pasta contém o código, as artes, os testes, o gerador e o HTML independente. As antigas pastas de trabalho em Documents/Codex não são necessárias para executar ou editar o jogo.

## Jogar

Abra `Pudim nas Nuvens.html` em um navegador. Ele contém todos os scripts e imagens e funciona offline. Os cartões da tela inicial permitem escolher qualquer mundo, sem precisar concluir os anteriores.

Para desenvolver, prefira servir a pasta e abrir `index.html`:

```sh
cd /Users/fraelmachado/Projects/pudim-nas-nuvens
python3 -m http.server 8767 --bind 127.0.0.1
```

Acesse <http://127.0.0.1:8767/index.html>. Se a porta estiver ocupada, reutilize o servidor correto ou escolha outra porta. Não dependa das prévias antigas na porta 8765: elas apontavam para uma pasta que foi movida. Encerre o servidor com Ctrl+C.

No celular, use um navegador que execute HTML local ou uma hospedagem. A prévia de anexos de alguns aplicativos não executa JavaScript. O servidor acima fica acessível apenas no próprio computador.

## Controles

- Setas ou A/D: andar.
- Espaço, ↑ ou W: pular. No jardim, toque para pular baixo e segure para pular alto.
- Nas fases 2 e 3, segure Pular durante a queda para abrir o guarda-chuva. Solte para descer; abra nas correntes de ar para subir.
- Toque nos botões na tela para jogar no celular.
- Encoste nos sininhos para acender pontes. Afaste-se e volte para tocar novamente.
- Esc ou Ⅱ: pausar. A partida também pausa ao sair da aba.
- ♫: ativar música de fundo e efeitos sonoros, inicialmente desligados. ⛶: tela cheia quando disponível.

## Estado atual

| Mundo | Mecânicas e identidade |
| --- | --- |
| 1. Jardim dos Pulos | Cenário ilustrado, saltos variáveis, folhas móveis, cogumelo de impulso e nuvens que desaparecem. O usuário aprovou esta fase. |
| 2. Nuvens de Algodão | Cenário próprio com moinhos e ilhas; guarda-chuva, vãos largos, correntes ascendentes, câmera vertical e touquinha em uma ilha elevada. |
| 3. Céu Estrelado | Céu noturno próprio, sininhos, pontes luminosas temporárias, vento, guarda-chuva e chegada à caminha com chuva de estrelas. |

Cada mundo tem três trechos, cinco estrelas e uma touquinha opcional. Bandeirinhas marcam os pontos de retorno. Não há limite de tentativas.

Quatro das cinco estrelas ficam no caminho principal; a quinta é uma escolha do jogador. No jardim ela flutua alto sobre a plataforma 7 e só o salto segurado alcança — um toque passa por baixo. Nas nuvens e na noite ela fica no alto de uma corrente de ar e exige pairar com o guarda-chuva. As posições são `{i,dx,dy}` em `starIndices` (jardim `{i:7,dy:-110}`, nuvens `{i:6,dx:-185,dy:-125}`, noite `{i:11,dx:-153,dy:-145}`).

O melhor resultado de cada mundo (número de estrelas e se a touquinha foi encontrada) e a preferência de som ficam salvos em `localStorage`, na chave `pudim-nas-nuvens`. Os cartões da tela inicial mostram esse melhor resultado, que nunca é rebaixado ao rejogar. O jogo funciona normalmente quando `localStorage` não está disponível. O progresso dentro de uma partida continua valendo só para aquela partida.

O botão "♫ Ligar a música" aparece também na tela inicial, ao lado de "Entrar no jardim", para que a música seja descoberta sem procurar no HUD. O áudio só é criado dentro de um gesto do jogador.

Ao voltar para a bandeirinha depois de uma queda, Pudim reaparece com um fade de 0,55 s e uma nuvenzinha de partículas claras. A física não muda. Cada queda também é registrada como `console.info('queda', {mundo, trecho, x})`, para a sessão de observação descrita em `docs/sessao-de-teste.md`.

A touquinha marca apenas a conquista da fase em que está sendo jogada, como sempre foi. Uma variação em que Pudim vestia todos os lacinhos já conquistados, com uma cor por mundo, foi implementada e revertida a pedido do usuário; não reintroduza sem novo pedido.

A primeira versão tinha gráficos geométricos e fases repetitivas. Após feedback, o jardim recebeu um redesenho completo; depois as outras duas fases ganharam cenários e mecânicas próprias. A direção aprovada é um livro infantil ilustrado, com Pudim parecendo uma pelúcia viva e desafios gentis, porém reais.

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura da interface e ordem de carregamento dos scripts. |
| `style.css` | Layout responsivo, menus e tela cheia. |
| `worlds.js` | Descrição das fases 2 e 3, ventos, sinos e pontes. |
| `engine.js` | Física, fase 1, colisões, itens, checkpoints e mecânicas. |
| `renderer.js` | Canvas, câmera, sprites, guarda-chuva, cenários e efeitos. |
| `game.js` | Controles, estados da interface, som, progresso salvo e loop de atualização. |
| `music.js` | Três trilhas originais sintetizadas em Web Audio. |
| `assets/` | Imagens originais, prompts e referência da pelúcia quando disponível. |
| `assets.js` | **Gerado:** imagens incorporadas como data URLs. |
| `Pudim nas Nuvens.html` | **Gerado:** versão independente para jogar offline. |
| `build.py` | Regenera os arquivos incorporados e, opcionalmente, um ZIP. |
| `engine.test.cjs` | Regressão do jardim, física e rotas. |
| `input.test.cjs` | Controles e transições da interface em um ambiente simulado. |
| `worlds.test.cjs` | Guarda-chuva, sinos, pontes, ventos e rotas novas. |
| `routes.cjs` | Simulador auxiliar dos percursos nos testes. |
| `music.test.cjs` | Composições, agendamento e troca de mundo. |
| `docs/sessao-de-teste.md` | Roteiro para observar a criança jogando. |
| `.gitignore` | Mantém `.DS_Store` e os ZIP fora do repositório. |
| `LEIA-ME.md` | Guia curto de uso. |

## Testar e gerar a distribuição

Necessário apenas para desenvolvimento: Node.js com suporte a `node:test`, Python 3 e `cwebp` (`brew install webp`). Não há pacotes npm para instalar. A validação anterior usou Node 22 e cwebp 1.6.

```sh
node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs
python3 build.py
python3 build.py --zip ./Pudim-nas-Nuvens.zip
```

Edite os arquivos separados e depois execute o gerador. Não edite manualmente `assets.js` nem `Pudim nas Nuvens.html`: serão sobrescritos.

`build.py` converte as seis artes para WebP com `cwebp` antes de incorporá-las: cenários com perda (`-q 82`) e sprites de fundo verde em alta qualidade (`-q 96 -sharp_yuv`), para que a remoção de cor em runtime não deixe franjas. Isso levou o HTML offline de 18,4 MB para 2,4 MB, e o gerador aborta se passar de 4 MB. Se algum sprite mostrar franja verde, troque a qualidade daquela imagem por `'lossless'` em `IMAGES`.

O ZIP contém apenas `Pudim nas Nuvens.html` e `LEIA-ME.md` — o que alguém precisa para jogar. Fontes, testes e artes de referência ficam só na pasta.

Última validação registrada: **56 testes passando**, incluindo travessias a 30/60/120 FPS, touquinhas, controles, pausa, seleção direta dos mundos, resultado final, progresso salvo, preferência de som, estrelas fora do caminho e registro de quedas. Também houve conferência visual em navegador, incluindo layout móvel simulado. A física do jardim foi comparada à versão anterior em 15.000 passos e permaneceu idêntica. Isso não substitui testes de diversão com a criança ou testes em aparelhos físicos.

## Artes e limitações conhecidas

As imagens foram geradas com imagegen; os prompts estão em `assets/PROMPTS.md` e `assets/PROMPTS-CEUS.md`. A pelúcia fornecida pelo usuário é a referência de identidade.

O atlas `pudim-poses.png` contém quatro poses sobre verde uniforme. O renderer remove essa cor ao carregar; não é um PNG com transparência nativa. O recorte atual pressupõe células de 384 pixels, com origem vertical 215 e altura 584. Ao substituir a arte, ajuste e valide esses valores. Todos os recursos necessários ao jogo são incorporados no HTML final.

`assets/referencia-pelucia.png` não é usada pelo jogo e não entra mais no ZIP. Parece uma foto pessoal: não mova nem apague esse arquivo sem o usuário decidir.

A pasta é um repositório git local, criado em 2026-09-12 para registrar estas melhorias. Não há remoto configurado.

O progresso agora persiste no navegador (`localStorage`), por dispositivo. Não há hospedagem pública nem integração com contas. Não há tarefa pendente obrigatória registrada: aguarde o próximo feedback antes de ampliar o escopo.


## Pose do guarda-chuva

Ao planar, `renderer.js` usa `assets/pudim-guarda-chuva.png`: uma pose integrada com a patinha segurando o cabo ao lado do rosto. Não sobreponha novamente um cabo à pose de salto. O fundo verde usa a mesma remoção de cor do atlas. A imagem inteira é dimensionada pela altura do corpo (`hh / 0.59`), com ancoragem horizontal 0.43 e vertical 0.915 para manter os pés alinhados. Ao trocar esta arte, confira escala, ancoragem, recorte e espelhamento nos dois sentidos. `build.py` incorpora a imagem como `PudimAssets.flight`.


### Continuidade de cor

O atlas `assets/pudim-poses.png` é a referência de cor da pelúcia: rosa claro quente, com realces creme e sombras suaves. A pose do guarda-chuva foi harmonizada com esse atlas, preservando duas pernas separadas e a patinha no cabo. Use o atlas como referência em futuras edições para evitar mudanças de rosa entre animações.


## Música de fundo

Três composições originais sintetizadas em `music.js`, sem downloads nem dependências: **Passeio entre flores** (jardim, 80 BPM), **Valsa de algodão** (nuvens, 66 BPM) e **Boa noite, Pudim** (estrelas, 54 BPM). Melodias suaves com acompanhamento de acordes, em ciclos de 32 tempos. O botão ♫ ativa música e efeitos. Pausa, ajuda, resultado e saída da partida silenciam a trilha; retomar continua a sequência e trocar de mundo seleciona outra composição. O som começa desligado e requer um toque no botão do jogador.

`music.test.cjs` verifica composições distintas, agendamento sem duplicação, interrupção e troca de mundo. A qualidade musical pode ser refinada com feedback de escuta.


## Descanso ao concluir cada fase

A vitória inicia o modo `ending` por 4,2 segundos antes do resultado. `state.endingTime` avança apenas nesse modo; pausa, perda de foco e ajuda congelam a sequência. A física já concluída permanece intacta. O renderer aproxima Pudim, faz a transição para `assets/pudim-dormindo.png`, desenha a coberta em primeiro plano e anima respiração e pequenos zês. O recorte da nova arte é calculado pelo alfa após remover o verde. A música acompanha o descanso e para no resultado. Repetir ou avançar cria um estado novo sem endingTime.


## Ícone do Pudim

`assets/pudim.ico` contém a carinha com transparência em 16, 24, 32, 48, 64, 128 e 256 pixels, para uso em atalhos e como favicon. `assets/pudim-icon.png` é a versão PNG de 256 pixels. Arte criada com imagegen integrado a partir do atlas aprovado; `favicon.ico` na raiz é usado pelo `index.html` e incorporado como data URL no HTML offline por `build.py`.


## Touquinha de dormir

A touquinha lilás com estrela e pompom substitui o lacinho como item opcional. Ao coletá-la, Pudim a usa ao andar, pular, planar e dormir naquela fase. O melhor resultado continua salvo, mas ele só veste a touquinha após encontrá-la na partida atual. A arte vetorial está em `assets/touquinha.svg` e é incorporada ao HTML offline. Conquistas antigas do lacinho passam a aparecer como touquinhas.
