import type { Config } from "tailwindcss";

/**
 * Paleta oficial do Projeto Nativas.
 *
 * REGRA DE CONTRASTE QUE NAO PODE SER QUEBRADA: o verde da marca (#7B982C) e
 * claro. Texto sobre `verde` e sempre `verdeTinta` — nunca branco, que nao
 * passa em AA. `verde` e `verdeClaro` tambem nao servem como texto sobre
 * branco ou areia: use como fundo, marcador ou sobre fundo escuro.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        verde: "#7B982C",
        verdeHover: "#8AA836",
        verdeEscuro: "#3F4F17",
        verdeTinta: "#1B2410",
        verdeClaro: "#B8CF5A",
        verdePalido: "#D6DFB0",
        broto: "#EEF2DD",
        madeira: "#7A4B27",
        madeiraTint: "#FBEFE6",
        areia: "#FAF6EC",
        areiaEscura: "#EFE9DA",
        areiaColuna: "#F1EDE0",
        borda: "#E6E1D2",
        bordaForte: "#D9D4C3",
        azul: "#2C5FA8",
        azulHover: "#245090",
        azulTint: "#E8EEF7",
        tinta: "#1F2A22",
        tintaCard: "#3B4A3E",
        cinza: "#5C6B5F",
        cinzaMeta: "#8A8A74",
        placeholder: "#9A9784",
      },
      fontFamily: {
        // PP Rader e TT Travels sao as fontes da identidade (ver src/index.css).
        // Unbounded e Outfit entram por Google Fonts como fallback ate os
        // arquivos chegarem em public/fonts/.
        display: ['"PP Rader"', "Unbounded", "system-ui", "sans-serif"],
        corpo: ['"TT Travels"', "Outfit", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Escala do sistema, em px, para nao precisar converter rem de cabeca.
        "11": "11px",
        "12": "12px",
        "13": "13px",
        "14": "14px",
        "15": "15px",
        "16": "16px",
        "17": "17px",
        "18": "18px",
        "24": "24px",
        "30": "30px",
        "32": "32px",
        // Titulos do portal sao fluidos.
        titulo: "clamp(34px, 4.2vw, 52px)",
        subtitulo: "clamp(24px, 2.6vw, 34px)",
      },
      borderRadius: {
        campo: "10px",
        botao: "12px",
        cartao: "16px",
        folha: "20px",
      },
      screens: {
        // O sistema troca de navegacao inferior para sidebar aos 900px.
        sistema: "900px",
      },
      letterSpacing: {
        rotulo: "0.08em",
        rotuloPortal: "0.12em",
        titulo: "-0.02em",
        tituloForte: "-0.035em",
      },
      maxWidth: {
        conteudo: "1160px",
      },
      spacing: {
        sidebar: "236px",
        toque: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
