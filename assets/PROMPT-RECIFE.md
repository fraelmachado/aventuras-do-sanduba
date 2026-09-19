# Artes do Recife dos Abraços

Geradas com a ferramenta integrada imagegen em 2026-09-19.

## `recife.png`

Prompt: “Wide 3:2 panoramic underwater coral reef scene, hand painted storybook illustration with soft gouache and watercolor texture. Clear turquoise water with sunbeams, luminous blue green middle, coral gardens and sea plants along bottom and edges, welcoming coral grotto hinted on right. Gameplay platforms and characters drawn separately, so center mostly uncluttered. No characters, text, border or interface.”

## `sanduba-nadando.png`

Referência: `sanduba-poses.png`. Prompt: “New full-body sprite of the same warm light pink plush pig Sanduba, with cream highlights, soft fur, black bead eyes, rounded snout and droopy ears. Swimming to the right with two separate kicking legs and both paws visible, small turquoise snorkel mask and tube, entire body in frame, same proportions as atlas, one pose only.” A primeira geração veio com fundo escuro. Uma edição pela ferramenta integrada removeu o fundo e produziu alfa transparente, preservando personagem e snorkel. A fonte foi reduzida para 900 × 600 antes de incorporar em WebP.

## `sanduba-nadando-2.png`

Referência: `sanduba-nadando.png`. Prompt: “Edit this transparent sprite into a second swimming kick frame. Preserve exact plush pig identity, pink fur, snout, eyes, ears, turquoise snorkel, body size, orientation and transparent background. Raise the near paw toward the mask, sweep the far paw down and back, bend the upper rear leg up, extend the lower rear leg back. Both paws and both distinct legs visible. Single full-body sprite, no text or scenery.” A arte também foi reduzida para 900 × 600. O renderer alterna os dois quadros a 4,4 trocas por segundo usando o tempo da física, portanto a animação para com a pausa.

Os animais abaixo usam `recife.png` apenas como referência de estilo e paleta. As imagens fonte têm fundo alfa transparente; `build.py` as converte para WebP e incorpora no HTML offline.

## `peixe-recife.png`

> Use the referenced underwater scene ONLY as a style and palette reference. Create a NEW isolated game sprite: a small golden and coral pink tropical reef fish, anatomically believable side view facing right, with distinct dorsal fin, translucent pectoral fin, forked tail, subtle iridescent scales, rounded attentive eye, gentle friendly expression. Children's illustrated storybook gouache and watercolor, detailed but readable at 70 pixels wide, warm highlights contrasting against turquoise water. Entire fish visible with generous transparent padding, TRUE TRANSPARENT ALPHA background, no water, no reef, no shadow, no text, no border, no other animals. One fish.

## `agua-viva.png`

> Use the referenced underwater scene ONLY as a style and palette reference. Create a NEW isolated game sprite: one delicate lilac and pale blue jellyfish, anatomically believable translucent bell with subtle radial structure and several flowing distinct tentacles, gentle child-friendly expression through shape only. Children's illustrated storybook gouache and watercolor, detailed but readable at 75 pixels high, luminous cool highlights contrasting against turquoise water. Entire animal visible with transparent padding, TRUE TRANSPARENT ALPHA background, no water, no reef, no shadow, no text, no border, no other animals. One jellyfish.
