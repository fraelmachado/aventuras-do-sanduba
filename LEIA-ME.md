# Sanduba nas Nuvens — três aventuras

Abra **Sanduba nas Nuvens.html** no navegador. Tudo está incorporado: funciona offline e sem instalar dependências. Também é possível abrir `index.html`, mantendo os outros arquivos na mesma pasta.

Escolha qualquer mundo nos cartões da tela inicial. É possível seguir do jardim até o final ou experimentar diretamente uma fase nova.

O melhor resultado de cada mundo fica salvo no navegador e aparece no cartão (as estrelinhas e a indicação de touquinha). Rejogar nunca diminui o que já foi conquistado. Como fica salvo no navegador, é por aparelho — e some se você limpar os dados do site.

Na tela inicial há também o botão **♫ Ligar a música**, ao lado de "Entrar no jardim". A escolha fica lembrada para a próxima vez.

## Controles

- Setas ou A/D: andar. Espaço, ↑ ou W: pular.
- No jardim, toque para pular baixo; segure para pular alto.
- Nas nuvens e na noite, **segure Pular no ar para abrir o guarda-chuva**. Solte para descer mais rápido. Abra-o dentro das correntes de ar para subir.
- No celular, use os botões abaixo do cenário. Alguns aplicativos só mostram uma prévia do HTML: abra em um navegador que execute arquivos locais ou sirva a pasta por HTTP.
- Esc ou Ⅱ: pausar. ⛶: tela cheia nos navegadores compatíveis. ♫: ligar/desligar o som.
- Na noite, encoste no sino para acender as pontes. Afaste-se e volte para tocar novamente. As pontes ficam acesas por 7, 9 e 13 segundos, conforme o trecho; o contador mostra o tempo restante.

## Os mundos

**Jardim dos Pulos:** a fase anterior foi preservada. Folhas móveis, saltos de altura variável, cogumelo e nuvens temporárias.

**Nuvens de Algodão:** céu próprio com moinhos e ilhas. A rota sobe mais de 700 pixels, a câmera acompanha a subida, e vãos largos exigem planar. Correntes de ar ajudam a ganhar altura. Há um touquinha em uma ilha elevada opcional.

**Céu Estrelado:** cenário noturno próprio, ilhas lunares, três sininhos e pontes de constelações que aparecem por tempo limitado. O último trecho combina vento e guarda-chuva. A chegada à caminha tem uma chuva de estrelas.

Cada mundo tem três trechos, cinco estrelas e uma touquinha opcional. As bandeirinhas marcam o ponto de retorno após uma queda — Sanduba reaparece devagarinho, com uma nuvenzinha. Tentativas ilimitadas.

Quatro estrelas ficam no caminho. **A quinta é escondida e pede vontade de explorar:** no jardim, ela flutua alto e só o pulo segurado alcança; nas nuvens e na noite, ela fica no alto de uma corrente de ar, e é preciso abrir o guarda-chuva e deixar o vento levar.

## Arquivos e manutenção

HTML5, CSS, JavaScript, Canvas e Web Audio puros, sem framework ou biblioteca externa.

- `worlds.js`: desenho das fases 2 e 3.
- `engine.js`: física, primeira fase, itens, vento e sininhos.
- `renderer.js`: cenários, personagem, guarda-chuva e efeitos.
- `game.js`: controles e interface.
- `assets/`: quatro imagens e registro dos prompts de geração.
- `assets.js`: cópias incorporadas das imagens para uso offline.
- `build.py`: regenera os assets incorporados e o HTML único após editar os arquivos separados. Precisa do `cwebp` (`brew install webp`), que converte as artes e deixa o HTML em cerca de 2,4 MB. Execute `python3 build.py`. ZIP opcional: `python3 build.py --zip /caminho/Sanduba.zip`.

Verificação com Node: `node --test engine.test.cjs input.test.cjs worlds.test.cjs music.test.cjs`.
As artes foram criadas pela ferramenta imagegen integrada. O personagem usa a pelúcia enviada como referência. A primeira fase não recebeu alterações de geometria ou dificuldade nesta revisão.


## Touquinha de dormir

A touquinha lilás com estrela e pompom substitui o lacinho como item opcional. Ao coletá-la, Sanduba a usa ao andar, pular, planar e dormir naquela fase. O melhor resultado continua salvo, mas ele só veste a touquinha após encontrá-la na partida atual. A arte vetorial está em `assets/touquinha.svg` e é incorporada ao HTML offline. Conquistas antigas do lacinho passam a aparecer como touquinhas.
