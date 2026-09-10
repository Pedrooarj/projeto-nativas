# Fontes da identidade

Coloque aqui os dois arquivos:

- `PPRader-Bold.otf` — fonte display (títulos, slogan, números grandes)
- `TTTravels-Medium.otf` — fonte de corpo (texto de leitura e de interface)

O `@font-face` das duas já está escrito em `web/src/index.css`. Enquanto os
arquivos não estiverem aqui, o navegador cai nos fallbacks carregados por Google
Fonts no `index.html`: **Unbounded** no lugar da PP Rader e **Outfit** no lugar
da TT Travels. O layout não quebra, só muda a cara.

TT Travels tem um peso único (Medium). A hierarquia do texto vem de tamanho e
cor, nunca de peso.

A terceira fonte, **IBM Plex Mono**, vem do Google Fonts e não precisa de arquivo
aqui. Ela marca o que é identificador ou rótulo do sistema: etiqueta `A-102`,
coordenadas e rótulo de campo.
