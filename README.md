# As aventuras do Sanduba

Jogo ilustrado em HTML5, CSS e JavaScript puros para uma criança de 10 anos. O porquinho de pelúcia Sanduba atravessa quatro mundos. O jogo roda offline, sem frameworks, pacotes ou serviços de rede.

## Jogar

Abra `Sanduba nas Nuvens.html` no navegador. O nome do arquivo foi mantido para preservar acessos existentes; o título apresentado ao jogador é **As aventuras do Sanduba**. Esse arquivo inclui o código e todas as imagens. Para desenvolvimento, sirva esta pasta com `python3 -m http.server 8767 --bind 127.0.0.1` e abra `http://127.0.0.1:8767/index.html`. Use recarga sem cache após mudar scripts.

O Jardim dos Pulos fica disponível desde o início. Cada fase seguinte é desbloqueada ao concluir a anterior com seu item especial. Os quatro cartões permanecem visíveis; um cartão bloqueado explica o requisito ao receber foco ou ser ativado. Vitórias e melhores resultados persistem no navegador quando `localStorage` está disponível.

## Mundos e controles

| Mundo | Caminho | Item exigido |
| --- | --- | --- |
| Jardim dos Pulos | Saltos variáveis, folhas móveis, cogumelo e nuvens que somem | Flor Dourada |
| Nuvens de Algodão | Guarda-chuva, vãos largos, correntes e ilhas elevadas | Gota de Nuvem |
| Céu Estrelado | Sinos, pontes temporárias, ventos e guarda-chuva | Luazinha |
| Recife dos Abraços | Nado, bolhas, algas, animais e correntes até o arco de coral | Pérola-Coração |

Setas ou A/D movem Sanduba. Espaço, ↑ ou W servem para Pular. No jardim, um toque dá um salto curto e segurar dá um salto alto. Nas nuvens e estrelas, segurar Pular durante a queda abre o guarda-chuva; soltar fecha. No recife, esquerda/direita nadam, segurar Pular sobe e soltar desce devagar. O sprite subaquático alterna dois quadros com batidas de bracinhos e perninhas; a animação congela na pausa. Os mesmos controles aparecem em botões de toque; no recife o botão se chama **Subir**. Esc ou Ⅱ pausa. O jogo também pausa ao perder foco.

Cada mundo tem três trechos e cinco colecionáveis comuns: estrelas nos três primeiros, conchas no recife. Uma fica em desvio opcional. Bandeirinhas e boias são checkpoints. Tentativas ilimitadas e nenhum cronômetro de oxigênio. Animais marinhos seguem movimentos previsíveis; contato causa empurrão leve e breve invulnerabilidade. O snorkel já está vestido ao entrar no recife. Não há combate nem guarda-chuva subaquático.

O item especial de cada fase aparece antes da chegada. Chegar sem ele mostra uma dica gentil e um botão acessível para voltar a um ponto seguro antes do item, preservando o que já foi coletado. Também é possível voltar nadando ou pelo caminho. Depois da chegada, Sanduba comemora com as patinhas e manda um beijinho que vira coração. No recife, o coração aparece numa bolha. Após as fases 1–3, o resultado oferece a próxima fase; após a quarta, mostra o fim da aventura.

O botão ♫ liga a música e os efeitos; o som começa desligado. As quatro trilhas originais são sintetizadas com Web Audio, sem downloads. Pausa, ajuda, resultado e menu silenciam a trilha. O contexto de áudio é criado apenas após um gesto do jogador.

## Progresso e compatibilidade

A chave atual de `localStorage` é `sanduba-nas-nuvens`; a antiga `pudim-nas-nuvens` é lida como reserva. Cada mundo guarda `{stars,item,complete}`. Um save antigo com `bow:true` é migrado para `item:true,complete:true`, preservando estrelas e o desbloqueio. O melhor número de colecionáveis e uma vitória anterior nunca regridem. Sem `localStorage`, a partida continua normalmente.

## Estrutura

- `engine.js`: física independente do DOM, fase 1, nado, itens, checkpoints e chegada.
- `worlds.js`: descrição das fases 2–4, ventos, sinos, correntes e animais.
- `renderer.js`: Canvas, câmera, sprites, cenários e comemoração.
- `game.js`: entrada, interface, progresso, som e loop fixo de 1/120 s.
- `music.js`: quatro trilhas originais em Web Audio.
- `assets/`: artes fonte e prompts. O atlas `sanduba-poses.png` é a referência da cor da pelúcia.
- `build.py`: gera `assets.js` e `Sanduba nas Nuvens.html`; não edite os gerados diretamente.

## Testar e gerar

É necessário Node.js, Python 3 e `cwebp` para gerar o HTML. Não há dependências npm.

```sh
node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs adventure.test.cjs renderer.test.cjs offline.test.cjs
python3 build.py
```

O HTML offline deve ficar abaixo de 4 MB; o gerador aborta caso ultrapasse. `python3 build.py --zip ./Sanduba-nas-Nuvens.zip` gera um ZIP opcional com apenas o HTML e `LEIA-ME.md`. O ZIP não é necessário para desenvolvimento.

A física e os percursos automatizados verificam 30/60/120 FPS, mas não substituem uma sessão de diversão com a criança nem uma conferência visual em desktop e celular. `docs/sessao-de-teste.md` contém um roteiro de observação. Cada resgate é registrado como `console.info('queda', {mundo,trecho,x})`.

`assets/referencia-pelucia.png` é uma referência pessoal, não entra no jogo nem no ZIP. A touquinha e a pose de dormir de versões antigas também não são incorporadas ao HTML atual.
