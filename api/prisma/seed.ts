import {
  PrismaClient,
  Estagio,
  MetodoQuebra,
  SetorViveiro,
  TipoDestino,
  TipoRecipiente,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { gerarTag } from "../src/shared/gerarTag";

const prisma = new PrismaClient();

/**
 * Dados de exemplo para desenvolvimento. Rodar de novo apaga tudo e recria do
 * zero — inclusive o contador de etiquetas — para que as etiquetas geradas
 * sejam sempre as mesmas.
 *
 * IMPORTANTE: das espécies abaixo, só nome comum, nome científico e família são
 * dados reais. Descrição, porte, épocas, usos e fotos do acervo são preenchidos
 * pela COORDENAÇÃO e entram por importação de planilha (ver docs/escopo.md).
 * Não invente conteúdo botânico aqui: acervo com texto inventado é pior que
 * acervo vazio.
 */
async function main() {
  await limparBanco();

  const senhaAdmin = await bcrypt.hash("admin123", 12);
  const senhaEquipe = await bcrypt.hash("equipe123", 12);

  await prisma.usuario.createMany({
    data: [
      { email: "admin@nativas.ufrn.br", senhaHash: senhaAdmin, papel: "ADMIN" },
      { email: "equipe@nativas.ufrn.br", senhaHash: senhaEquipe, papel: "EQUIPE" },
    ],
  });

  // Colaborador não faz login: é só o nome escolhido no campo
  // "quem está registrando" de cada formulário (RN-06).
  const colaboradores = await criarEmSequencia(
    [
      "Ana Beatriz Nunes",
      "Carlos Eduardo Medeiros",
      "Joana Dantas de Araújo",
      "Luiz Fernando Sales",
      "Maria Clara Bezerra",
    ],
    (nome) => prisma.colaborador.create({ data: { nome } }),
  );
  const [ana, carlos, joana, luiz, maria] = colaboradores;

  const substratos = await criarEmSequencia(
    ["Composto do RU + areia 3:1", "Terra vegetal + esterco", "Substrato comercial"],
    (nome) => prisma.substrato.create({ data: { nome } }),
  );
  const [compostoRu, terraVegetal, comercial] = substratos;

  const especies = await criarEmSequencia(
    [
      { nomeComum: "Angico", nomeCientifico: "Anadenanthera colubrina", familia: "Fabaceae" },
      { nomeComum: "Aroeira", nomeCientifico: "Myracrodruon urundeuva", familia: "Anacardiaceae" },
      { nomeComum: "Baraúna", nomeCientifico: "Schinopsis brasiliensis", familia: "Anacardiaceae" },
      { nomeComum: "Catingueira", nomeCientifico: "Cenostigma pyramidale", familia: "Fabaceae" },
      { nomeComum: "Craibeira", nomeCientifico: "Tabebuia aurea", familia: "Bignoniaceae" },
      { nomeComum: "Ipê-roxo", nomeCientifico: "Handroanthus impetiginosus", familia: "Bignoniaceae" },
      { nomeComum: "Juazeiro", nomeCientifico: "Ziziphus joazeiro", familia: "Rhamnaceae" },
      { nomeComum: "Jurema-preta", nomeCientifico: "Mimosa tenuiflora", familia: "Fabaceae" },
      { nomeComum: "Mandacaru", nomeCientifico: "Cereus jamacaru", familia: "Cactaceae" },
      { nomeComum: "Mulungu", nomeCientifico: "Erythrina velutina", familia: "Fabaceae" },
      { nomeComum: "Pereiro", nomeCientifico: "Aspidosperma pyrifolium", familia: "Apocynaceae" },
      { nomeComum: "Umbuzeiro", nomeCientifico: "Spondias tuberosa", familia: "Anacardiaceae" },
    ],
    (dados) => prisma.especie.create({ data: dados }),
  );

  const porNome = (nomeComum: string) => {
    const especie = especies.find((item) => item.nomeComum === nomeComum);
    if (!especie) throw new Error("Especie fora da lista do seed: " + nomeComum);
    return especie;
  };

  // As matrizes ficam no entorno de Caicó-RN.
  const coletas = await criarEmSequencia(
    [
      { especie: "Angico", lat: -6.4512, lng: -37.0918, qtd: 500, data: "2026-02-10", local: "Trilha do Seridó, atrás do CERES", colaborador: ana },
      { especie: "Mandacaru", lat: -6.4478, lng: -37.0863, qtd: 300, data: "2026-02-18", local: "Cerca do sítio Boa Vista", colaborador: carlos },
      { especie: "Umbuzeiro", lat: -6.4631, lng: -37.1042, qtd: 200, data: "2026-03-02", local: "Beira do açude Itans", colaborador: joana },
      { especie: "Ipê-roxo", lat: -6.4395, lng: -37.0776, qtd: 400, data: "2026-03-14", local: "Praça do bairro Paraíba", colaborador: luiz },
      { especie: "Juazeiro", lat: -6.456, lng: -37.0995, qtd: 250, data: "2026-03-27", local: "Estrada para São José do Seridó, km 4", colaborador: maria },
      { especie: "Catingueira", lat: -6.4449, lng: -37.1108, qtd: 600, data: "2026-04-05", local: "Área de reserva do campus", colaborador: ana },
    ],
    (item) =>
      prisma.coleta.create({
        data: {
          especieId: porNome(item.especie).id,
          matrizLat: item.lat,
          matrizLng: item.lng,
          qtdSementes: item.qtd,
          dataColeta: new Date(item.data),
          localDescricao: item.local,
          colaboradorId: item.colaborador.id,
        },
      }),
  );

  const coletaDe = (nomeComum: string) => {
    const coleta = coletas.find((item) => item.especieId === porNome(nomeComum).id);
    if (!coleta) throw new Error("Sem coleta de " + nomeComum + " no seed.");
    return coleta;
  };

  // RN-05: a soma de sementes usada por coleta nunca passa a quantidade coletada.
  const definicaoDosLotes = [
    { especie: "Angico", sementes: 200, vivas: 170, data: "2026-02-20", recipiente: TipoRecipiente.TUBETE, tratamento: MetodoQuebra.ESCARIFICACAO, substrato: compostoRu, setor: SetorViveiro.SEMENTEIRAS, fina: "bancada 1", estagio: Estagio.ESTAGIO_1, colaborador: ana },
    { especie: "Angico", sementes: 150, vivas: 130, data: "2026-01-15", recipiente: TipoRecipiente.SACO, tratamento: MetodoQuebra.ESCARIFICACAO, substrato: terraVegetal, setor: SetorViveiro.CANTEIROS, fina: "canteiro 2", estagio: Estagio.ESTAGIO_2, colaborador: carlos },
    { especie: "Mandacaru", sementes: 120, vivas: 95, data: "2026-02-25", recipiente: TipoRecipiente.SEMENTEIRA, tratamento: MetodoQuebra.N, substrato: comercial, setor: SetorViveiro.SEMENTEIRAS, fina: "bancada 3", estagio: Estagio.ESTAGIO_1, colaborador: joana },
    { especie: "Mandacaru", sementes: 100, vivas: 85, data: "2025-11-08", recipiente: TipoRecipiente.SACO, tratamento: MetodoQuebra.N, substrato: comercial, setor: SetorViveiro.RUSTIFICACAO, fina: null, estagio: Estagio.FINALIZADO, colaborador: luiz },
    { especie: "Umbuzeiro", sementes: 80, vivas: 62, data: "2026-03-06", recipiente: TipoRecipiente.TUBETE, tratamento: MetodoQuebra.EMBEBICAO, substrato: compostoRu, setor: SetorViveiro.SEMENTEIRAS, fina: "bancada 2", estagio: Estagio.ESTAGIO_1, colaborador: maria },
    { especie: "Umbuzeiro", sementes: 60, vivas: 48, data: "2026-01-22", recipiente: TipoRecipiente.CANO, tratamento: MetodoQuebra.EMBEBICAO, substrato: terraVegetal, setor: SetorViveiro.CANTEIROS, fina: "fileira 4", estagio: Estagio.ESTAGIO_2, colaborador: ana },
    { especie: "Ipê-roxo", sementes: 180, vivas: 150, data: "2026-01-30", recipiente: TipoRecipiente.SACO, tratamento: MetodoQuebra.N, substrato: terraVegetal, setor: SetorViveiro.CANTEIROS, fina: "canteiro 1", estagio: Estagio.ESTAGIO_2, colaborador: carlos },
    { especie: "Ipê-roxo", sementes: 120, vivas: 100, data: "2025-10-19", recipiente: TipoRecipiente.SACO, tratamento: MetodoQuebra.N, substrato: comercial, setor: SetorViveiro.RUSTIFICACAO, fina: null, estagio: Estagio.FINALIZADO, colaborador: joana },
    { especie: "Juazeiro", sementes: 150, vivas: 118, data: "2026-04-02", recipiente: TipoRecipiente.SEMENTEIRA, tratamento: MetodoQuebra.ESCARIFICACAO, substrato: compostoRu, setor: SetorViveiro.SEMENTEIRAS, fina: "bancada 4", estagio: Estagio.ESTAGIO_1, colaborador: luiz },
    { especie: "Catingueira", sementes: 300, vivas: 240, data: "2025-12-03", recipiente: TipoRecipiente.CANO, tratamento: MetodoQuebra.ESCARIFICACAO, substrato: terraVegetal, setor: SetorViveiro.RUSTIFICACAO, fina: null, estagio: Estagio.FINALIZADO, colaborador: maria },
  ];

  const lotes = [];

  for (const definicao of definicaoDosLotes) {
    const especie = porNome(definicao.especie);

    const lote = await prisma.loteMudas.create({
      data: {
        tagUnica: await gerarTag(especie.nomeComum),
        especieId: especie.id,
        coletaId: coletaDe(definicao.especie).id,
        dataPlantio: new Date(definicao.data),
        qtdSementes: definicao.sementes,
        qtdMudasVivas: definicao.vivas,
        tipoRecipiente: definicao.recipiente,
        tratamentoSemente: definicao.tratamento,
        substratoId: definicao.substrato.id,
        setor: definicao.setor,
        identificacaoFina: definicao.fina,
        estagioAtual: definicao.estagio,
        colaboradorId: definicao.colaborador.id,
      },
    });
    lotes.push(lote);

    await prisma.historicoCrescimento.create({
      data: {
        loteId: lote.id,
        estagioAnterior: null,
        estagioNovo: Estagio.ESTAGIO_1,
        recipienteNovo: TipoRecipiente.TUBETE,
        setorNovo: SetorViveiro.SEMENTEIRAS,
        observacao: "Cadastro do lote.",
        dataTransferencia: new Date(definicao.data),
        colaboradorId: definicao.colaborador.id,
      },
    });

    if (definicao.estagio !== Estagio.ESTAGIO_1) {
      await prisma.historicoCrescimento.create({
        data: {
          loteId: lote.id,
          estagioAnterior: Estagio.ESTAGIO_1,
          estagioNovo: Estagio.ESTAGIO_2,
          recipienteNovo: definicao.recipiente,
          setorNovo: SetorViveiro.CANTEIROS,
          observacao: "Repicagem para a etapa 2.",
          colaboradorId: definicao.colaborador.id,
        },
      });
    }

    if (definicao.estagio === Estagio.FINALIZADO) {
      await prisma.historicoCrescimento.create({
        data: {
          loteId: lote.id,
          estagioAnterior: Estagio.ESTAGIO_2,
          estagioNovo: Estagio.FINALIZADO,
          setorNovo: SetorViveiro.RUSTIFICACAO,
          observacao: "Lote finalizado.",
          colaboradorId: definicao.colaborador.id,
        },
      });
    }
  }

  const finalizados = lotes.filter((lote) => lote.estagioAtual === Estagio.FINALIZADO);

  await prisma.destinoFinal.create({
    data: {
      loteId: finalizados[0].id,
      tipo: TipoDestino.PLANTIO_DEFINITIVO,
      data: new Date("2026-03-21"),
      quantidade: 85,
      destinoLat: -6.4702,
      destinoLng: -37.0854,
      localDescricao: "Margem do riacho, área de recuperação do sítio Carnaúba",
      colaboradorId: carlos.id,
    },
  });

  await prisma.destinoFinal.create({
    data: {
      loteId: finalizados[1].id,
      tipo: TipoDestino.PLANTIO_DEFINITIVO,
      data: new Date("2026-04-11"),
      quantidade: 100,
      destinoLat: -6.4338,
      destinoLng: -37.1201,
      localDescricao: "Calçada da Avenida Coronel Martiniano, mutirão de arborização",
      colaboradorId: ana.id,
    },
  });

  await prisma.destinoFinal.create({
    data: {
      loteId: finalizados[2].id,
      tipo: TipoDestino.DOACAO,
      data: new Date("2026-04-25"),
      quantidade: 240,
      destinatario: "Escola Municipal Antônio Aladim de Araújo",
      colaboradorId: joana.id,
    },
  });

  await prisma.visita.createMany({
    data: [
      { data: new Date("2026-03-05"), instituicao: "Escola Estadual Calpúrnia Caldas", numeroPessoas: 32, observacao: "Turmas do 5º ano.", colaboradorId: ana.id },
      { data: new Date("2026-03-19"), instituicao: "IFRN campus Caicó", numeroPessoas: 18, colaboradorId: carlos.id },
      { data: new Date("2026-04-08"), instituicao: "Arboriza Caicó", numeroPessoas: 9, observacao: "Alinhamento do mutirão de abril.", colaboradorId: joana.id },
      { data: new Date("2026-04-30"), instituicao: "Secretaria de Meio Ambiente (DMA)", numeroPessoas: 6, colaboradorId: luiz.id },
    ],
  });

  console.log("Seed concluído.");
  console.log(especies.length + " espécies, " + coletas.length + " coletas, " + lotes.length + " lotes");
  console.log("Etiquetas geradas: " + lotes.map((lote) => lote.tagUnica).join(", "));
}

/**
 * Cria um por um em vez de createMany porque precisamos dos ids de volta:
 * createMany não devolve as linhas criadas.
 */
async function criarEmSequencia<Entrada, Saida>(
  entradas: Entrada[],
  criar: (entrada: Entrada) => Promise<Saida>,
): Promise<Saida[]> {
  const saidas: Saida[] = [];
  for (const entrada of entradas) saidas.push(await criar(entrada));
  return saidas;
}

async function limparBanco() {
  await prisma.destinoFinal.deleteMany();
  await prisma.historicoCrescimento.deleteMany();
  await prisma.loteMudas.deleteMany();
  await prisma.coleta.deleteMany();
  await prisma.visita.deleteMany();
  await prisma.especie.deleteMany();
  await prisma.substrato.deleteMany();
  await prisma.colaborador.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.contadorTag.deleteMany();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (erro) => {
    console.error(erro);
    await prisma.$disconnect();
    process.exit(1);
  });
