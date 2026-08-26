const ordenarIds = (idA, idB) => (
  idA.localeCompare(idB) <= 0 ? [idA, idB] : [idB, idA]
);

const dentroDoPeriodo = (ano, anoInicial, anoFinal) => (
  Number.isFinite(Number(ano))
  && Number(ano) >= anoInicial
  && Number(ano) <= anoFinal
);

/**
 * Constrói um grafo não direcionado de coautoria entre docentes do programa.
 * `docente_ids` é usado como identificador autoritativo; os nomes informados
 * na lista de autores servem apenas para exibição da produção.
 */
export const buildCoauthorshipGraph = ({
  docentes = [],
  producoes = [],
  anoInicial = Number.NEGATIVE_INFINITY,
  anoFinal = Number.POSITIVE_INFINITY,
  natureza = 'todas',
  pesoMinimo = 1,
  somenteIntegraveis = true,
} = {}) => {
  const docentesPorId = new Map(docentes.map((docente) => [docente.id_docente, docente]));
  const producoesPorDocente = new Map(docentes.map((docente) => [docente.id_docente, 0]));
  const arestasPorPar = new Map();
  let producoesComCoautoria = 0;

  const producoesFiltradas = producoes.filter((producao) => {
    if (somenteIntegraveis && producao?.vinculo_programa?.integrar !== true) return false;
    if (!dentroDoPeriodo(producao.ano, anoInicial, anoFinal)) return false;
    if (natureza !== 'todas' && producao.natureza !== natureza) return false;
    return true;
  });

  producoesFiltradas.forEach((producao) => {
    const ids = [...new Set(producao.docente_ids || [])]
      .filter((id) => docentesPorId.has(id));

    ids.forEach((id) => {
      producoesPorDocente.set(id, (producoesPorDocente.get(id) || 0) + 1);
    });

    if (ids.length > 1) producoesComCoautoria += 1;

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const [source, target] = ordenarIds(ids[i], ids[j]);
        const chave = `${source}|${target}`;
        const aresta = arestasPorPar.get(chave) || {
          id: chave,
          source,
          target,
          peso: 0,
          producoes: [],
        };

        aresta.peso += 1;
        aresta.producoes.push({
          id: producao.id_producao,
          titulo: producao.titulo,
          ano: producao.ano,
          natureza: producao.natureza,
          tipos: producao.tipos || [],
        });
        arestasPorPar.set(chave, aresta);
      }
    }
  });

  const arestas = [...arestasPorPar.values()]
    .filter((aresta) => aresta.peso >= pesoMinimo)
    .sort((a, b) => b.peso - a.peso || a.id.localeCompare(b.id));

  const graus = new Map(docentes.map((docente) => [docente.id_docente, 0]));
  const pesos = new Map(docentes.map((docente) => [docente.id_docente, 0]));

  arestas.forEach((aresta) => {
    graus.set(aresta.source, (graus.get(aresta.source) || 0) + 1);
    graus.set(aresta.target, (graus.get(aresta.target) || 0) + 1);
    pesos.set(aresta.source, (pesos.get(aresta.source) || 0) + aresta.peso);
    pesos.set(aresta.target, (pesos.get(aresta.target) || 0) + aresta.peso);
  });

  const nos = docentes.map((docente) => ({
    id: docente.id_docente,
    nome: docente.nome,
    categoria: docente.vinculo_institucional?.categoria || 'não informada',
    instituicao: docente.vinculo_institucional?.instituicao || 'Não informada',
    grau: graus.get(docente.id_docente) || 0,
    pesoTotal: pesos.get(docente.id_docente) || 0,
    totalProducoes: producoesPorDocente.get(docente.id_docente) || 0,
  }));

  return {
    nos,
    arestas,
    estatisticas: {
      totalDocentes: nos.length,
      docentesConectados: nos.filter((no) => no.grau > 0).length,
      totalProducoes: producoesFiltradas.length,
      producoesComCoautoria,
      paresCoautoria: arestas.length,
      totalVinculos: arestas.reduce((total, aresta) => total + aresta.peso, 0),
    },
  };
};

export const getCoauthorshipYears = (producoes = [], somenteIntegraveis = true) => (
  [...new Set(
    producoes
      .filter((producao) => !somenteIntegraveis || producao?.vinculo_programa?.integrar === true)
      .map((producao) => Number(producao.ano))
      .filter(Number.isFinite)
  )].sort((a, b) => a - b)
);

