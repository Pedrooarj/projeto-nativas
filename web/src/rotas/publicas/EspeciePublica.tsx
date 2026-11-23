import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buscarEspeciePublica, ErroDaApi, type EspeciePublicaDados } from "../../lib/api";


/**
 * PLACEHOLDER — tela reservada para a equipe (ver docs/escopo.md).
 *
 * Duas partes quando ficar pronta: as informações botânicas preenchidas pela
 * coordenação e os números que o projeto já fez com a espécie (RN-08),
 * calculados pela API em GET /publico/especies/:id.
 */
export function EspeciePublica() {
  const { id } = useParams();

  const [dados, setDados] = useState<EspeciePublicaDados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    setCarregando(true);
    setErro(null);

    buscarEspeciePublica(id)
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch((problema: ErroDaApi) => {
        if (ativo) setErro(problema.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  const metricas = [
    { rotulo: "Coletas", valor: dados?.numeros.coletas },
    { rotulo: "Sementes Coletadas", valor:  dados?.numeros.sementesColetadas },
    { rotulo: "Mudas Produzidas", valor: dados?.numeros.mudasProduzidas },
    { rotulo: "Plantios", valor: dados?.numeros.plantiosDefinitivos },
  ];

  return (
    <main className="mx-auto max-w-conteudo px-5 py-16">
      <Link to="/acervo" className="text-15 text-verdeEscuro hover:underline" >
        &larr; Voltar ao acervo
      </Link>

      <p className="rotulo-portal mt-8 text-madeira">Espécie</p>
      <h1 className="mt-4 text-subtitulo">{dados ? dados.nomeComum : "Página da espécie"}</h1>
      
      <h2 className="mt-12 text-18 text-verdeEscuro">O que o projeto já fez</h2>

      {carregando ? (
        <p className="mt-4 text-16 text-cinza">Carregando números...</p>
      ) : erro ? (
        <p className="mt-4 rounded-campo bg-madeiraTinta px-4 py-3 text-15 text-madeira">
          Não consegui carregar os números agora: {erro}
        </p>
      ) : (
       <ul className="mt-4 grid gap-4 sistema:grid-cols-4">
          {metricas.map((metrica) => (
            <li key={metrica.rotulo}>
              <div className="h-full rounded-cartao bg-verdeEscuro p-5">
                <p className="font-display text-30 tracking-tituloForte text-areia sistema:text-[44px]">
                  {metrica.valor === undefined ? "—" : metrica.valor.toLocaleString("pt-BR")}
                </p>
                <p className="mt-2 font-mono text-12 uppercase tracking-rotuloPortal text-verdePalido">
                  {metrica.rotulo}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// export function EspeciePublica() {
//   const { id } = useParams();

//   return (
//     <main className="mx-auto max-w-conteudo px-5 py-16">
//       <Link to="/acervo" className="text-15 text-verdeEscuro hover:underline">
//         &larr; Voltar ao acervo
//       </Link>

//       <p className="rotulo-portal mt-8 text-madeira">Espécie</p>
//       <h1 className="mt-4 text-subtitulo">Página da espécie</h1>
//       <p className="etiqueta mt-2 text-cinzaMeta">id: {id}</p>

//       <Card className="mt-4 grid gap-4 sistema:grid-cols-4">
//         {/* trocar por buscarMetricas da API*/}
//         {metricas.map((metrica) => (
//           <li key={metrica.rotulo}>
//             <div className="h-full rounded-cartao bg-verdeEscuro p-5">
//               <p className="font-display text-30 tracking-tituloForte text-areia sistema:text-[44px]">
//                 {metrica.valor.toLocaleString("pt-BR")}
//               </p>
//               <p className="mt-2 font-mono text-12 uppercase tracking-rotuloPortal text-verdePalido"> 
//                 {metrica.rotulo}
//               </p>
//             </div>
//           </li>
//         ))}
//         {/* <p className="rotulo">Em construção</p>
//         <p className="mt-3 max-w-[70ch] text-16 text-cinza">
//           Informações botânicas, galeria e os números do projeto para esta espécie. É aqui que
//           entram as TAREFAS 6 e 7 de docs/aprendendo-react.md.
//         </p> */}
//       </Card>
//     </main>
//   );
// }
