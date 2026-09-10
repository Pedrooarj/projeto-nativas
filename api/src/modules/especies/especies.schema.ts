import { z } from "zod";

export const listarEspeciesQuerySchema = z.object({
  busca: z.string().trim().min(1).optional(),
});

const textoOpcional = z.string().trim().min(1).optional();

export const criarEspecieSchema = z.object({
  nomeComum: z.string().trim().min(2, "O nome comum precisa de pelo menos 2 letras."),
  nomeCientifico: z
    .string()
    .trim()
    .min(3, "O nome científico precisa de pelo menos 3 letras."),
  familia: z.string().trim().min(3, "Informe a família botânica."),
  descricao: textoOpcional,
  porte: textoOpcional,
  epocaFloracao: textoOpcional,
  epocaFrutificacao: textoOpcional,
  usos: z.array(z.string().trim().min(1)).default([]),
  fotoPrincipalUrl: z.string().url("Informe uma URL válida.").optional(),
  galeria: z.array(z.string().url("Informe uma URL válida.")).default([]),
});

export const atualizarEspecieSchema = criarEspecieSchema.partial();

export type DadosNovaEspecie = z.infer<typeof criarEspecieSchema>;
export type DadosEdicaoEspecie = z.infer<typeof atualizarEspecieSchema>;
