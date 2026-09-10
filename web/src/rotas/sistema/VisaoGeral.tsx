import { useEffect, useState } from "react";
import { buscarMetricas, ErroDaApi, type Metricas } from "../../lib/api";
import { Card } from "../../componentes/ui/Card";
import { useAuth } from "../../lib/auth";

export function VisaoGeral() {
  const { usuario } = useAuth();
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarMetricas()
      .then(setMetricas)
      .catch((problema: ErroDaApi) => setErro(problema.message));
  }, []);

  const contadores = [
    { rotulo: "Sementes coletadas", valor: metricas?.sementesColetadas },
    { rotulo: "Mudas no viveiro", valor: metricas?.mudasNoViveiro },
    { rotulo: "Plantios definitivos", valor: metricas?.plantiosDefinitivos },
    { rotulo: "Visitas recebidas", valor: metricas?.visitasRecebidas },
  ];

  return (
    <div>
      <p className="rotulo">Sistema do viveiro</p>
      <h1 className="mt-3 text-30">Visão geral</h1>
      <p className="mt-2 text-15 text-cinza">
        Bem-vindo, {usuario?.email}. Estes são os mesmos números que aparecem no portal.
      </p>

      {erro ? (
        <p className="mt-6 rounded-campo bg-madeiraTint px-4 py-3 text-15 text-madeira">{erro}</p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 sistema:grid-cols-4">
        {contadores.map((contador) => (
          <Card key={contador.rotulo}>
            <p className="font-display text-30 tracking-tituloForte text-verdeEscuro">
              {contador.valor === undefined ? "—" : contador.valor.toLocaleString("pt-BR")}
            </p>
            <p className="rotulo mt-2">{contador.rotulo}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-dashed">
        <p className="rotulo">Em construção</p>
        <p className="mt-3 max-w-[70ch] text-16 text-cinza">
          Lista dos últimos registros do viveiro (coletas, lotes e transições recentes). Depende
          dos endpoints de coletas e lotes.
        </p>
      </Card>
    </div>
  );
}
