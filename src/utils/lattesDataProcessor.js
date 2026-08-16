// Funções para processar os conjuntos integrados de currículos
import curriculosData from './curriculosDataAdapter';

/**
 * Processa produções agrupadas por ano
 * @param {Array} producoes - Lista de produções
 * @returns {Object} Dados agrupados por ano
 */
export const processProducoes = (producoes) => {
  const grouped = {};
  
  if (!Array.isArray(producoes)) return grouped;
  
  producoes.forEach(prod => {
    const ano = prod.ano || new Date().getFullYear();
    if (!grouped[ano]) {
      grouped[ano] = [];
    }
    grouped[ano].push(prod);
  });
  
  return grouped;
};

/**
 * Processa produções agrupadas por ano e tipo
 * @param {Array} producoes - Lista de produções
 * @returns {Object} Dados no formato { [ano]: { [tipo]: quantidade } }
 */
export const processProducoesPorAnoETipo = (producoes) => {
  const grouped = {};

  if (!Array.isArray(producoes)) return grouped;

  producoes.forEach((prod) => {
    const ano = prod.ano || new Date().getFullYear();
    const tipo = prod.tipo || 'Tipo não informado';

    if (!grouped[ano]) {
      grouped[ano] = {};
    }

    if (!grouped[ano][tipo]) {
      grouped[ano][tipo] = 0;
    }

    grouped[ano][tipo] += 1;
  });

  return grouped;
};

/**
 * Processa orientações por nível e ano
 * @param {Object} orientacoes - Objeto com orientações por nível
 * @returns {Object} Dados processados
 */
export const processOrientacoes = (orientacoes) => {
  const processed = {};
  
  if (!orientacoes || typeof orientacoes !== 'object') return processed;
  
  const niveis = ['mestrado', 'doutorado', 'pos_doutorado', 'iniciacao_cientifica', 'outras'];
  
  niveis.forEach(nivel => {
    const list = orientacoes[nivel] || [];
    
    if (Array.isArray(list)) {
      list.forEach(orient => {
        const ano = orient.ano || orient.ano_fim || new Date().getFullYear();
        const situacao = orient.situacao || 'Concluído';
        
        if (!processed[ano]) {
          processed[ano] = { ativo: 0, concluido: 0, total: 0 };
        }
        
        processed[ano].total += 1;
        
        if (situacao.toLowerCase().includes('andamento') || 
            situacao.toLowerCase().includes('em-andamento')) {
          processed[ano].ativo += 1;
        } else {
          processed[ano].concluido += 1;
        }
      });
    }
  });
  
  return processed;
};

/**
 * Processa projetos agrupados por ano
 * @param {Array} projetos - Lista de projetos
 * @returns {Object} Dados agrupados por ano e situação
 */
export const processProjectos = (projetos) => {
  const grouped = {};
  
  if (!Array.isArray(projetos)) return grouped;
  
  projetos.forEach(proj => {
    const ano = proj.ano_inicio || proj.ano_fim || new Date().getFullYear();
    const situacao = proj.situacao || 'Concluído';
    
    if (!grouped[ano]) {
      grouped[ano] = { ativo: 0, concluido: 0, total: 0 };
    }
    
    grouped[ano].total += 1;
    
    if (situacao.toLowerCase().includes('andamento') || 
        situacao.toLowerCase().includes('em-andamento')) {
      grouped[ano].ativo += 1;
    } else {
      grouped[ano].concluido += 1;
    }
  });
  
  return grouped;
};

/**
 * Prepara dados para gráfico de produções por ano
 * @param {Object} producoesPorAno - Dados processados
 * @returns {Object} Objeto com series e categories
 */
export const prepareDadosProducoes = (producoesPorAno) => {
  const anos = Object.keys(producoesPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);
  
  if (anos.length === 0) {
    return { series: [{ name: 'Produções', data: [] }], categories: [] };
  }
  
  const data = anos.map(ano => producoesPorAno[ano]?.length || 0);
  
  return {
    series: [
      {
        name: 'Produções',
        data: data
      }
    ],
    categories: anos.map(a => a.toString())
  };
};

/**
 * Prepara dados para gráfico de orientações por ano com status
 * @param {Object} orientacoesPorAno - Dados processados
 * @returns {Object} Objeto com series e categories
 */
export const prepareDadosOrientacoes = (orientacoesPorAno) => {
  const anos = Object.keys(orientacoesPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);
  
  if (anos.length === 0) {
    return {
      series: [
        { name: 'Em Andamento', data: [] },
        { name: 'Concluído', data: [] }
      ],
      categories: []
    };
  }
  
  const ativoData = anos.map(ano => orientacoesPorAno[ano]?.ativo || 0);
  const concluidoData = anos.map(ano => orientacoesPorAno[ano]?.concluido || 0);
  
  return {
    series: [
      {
        name: 'Em Andamento',
        data: ativoData
      },
      {
        name: 'Concluído',
        data: concluidoData
      }
    ],
    categories: anos.map(a => a.toString())
  };
};

/**
 * Prepara dados para gráfico de projetos por ano com status
 * @param {Object} projetosPorAno - Dados processados
 * @returns {Object} Objeto com series e categories
 */
export const prepareDadosProjetos = (projetosPorAno) => {
  const anos = Object.keys(projetosPorAno)
    .map(a => parseInt(a))
    .sort((a, b) => a - b);
  
  if (anos.length === 0) {
    return {
      series: [
        { name: 'Em Andamento', data: [] },
        { name: 'Concluído', data: [] }
      ],
      categories: []
    };
  }
  
  const ativoData = anos.map(ano => projetosPorAno[ano]?.ativo || 0);
  const concluidoData = anos.map(ano => projetosPorAno[ano]?.concluido || 0);
  
  return {
    series: [
      {
        name: 'Em Andamento',
        data: ativoData
      },
      {
        name: 'Concluído',
        data: concluidoData
      }
    ],
    categories: anos.map(a => a.toString())
  };
};

/**
 * Processa orientações por nível (contagens por situação)
 * @param {Object} orientacoes - Objeto com chaves por nível contendo arrays de orientações
 * @returns {Object} Objeto com estrutura { [nivel]: { ativo: number, concluido: number, total: number } }
 */
export const processOrientacoesPorNivel = (orientacoes) => {
  const result = {};
  if (!orientacoes || typeof orientacoes !== 'object') return result;

  const niveis = ['mestrado', 'doutorado', 'pos_doutorado', 'iniciacao_cientifica', 'outras'];

  niveis.forEach((nivel) => {
    result[nivel] = { ativo: 0, concluido: 0, total: 0 };
    const list = orientacoes[nivel] || [];
    if (!Array.isArray(list)) return;

    list.forEach((orient) => {
      const situacao = (orient.situacao || orient.status || 'Concluído').toString().toLowerCase();
      result[nivel].total += 1;
      if (situacao.includes('andamento') || situacao.includes('em-andamento') || situacao.includes('em andamento')) {
        result[nivel].ativo += 1;
      } else {
        result[nivel].concluido += 1;
      }
    });
  });

  return result;
};

/**
 * Prepara dados para gráfico de orientações por nível
 * @param {Object} orientacoesPorNivel - Resultado de `processOrientacoesPorNivel`
 * @returns {Object} { series: [ {name, data} ], categories: [labels] }
 */
export const prepareDadosOrientacoesPorNivel = (orientacoesPorNivel) => {
  const nivelLabels = {
    mestrado: 'Mestrado',
    doutorado: 'Doutorado',
    pos_doutorado: 'Pós-Doutorado',
    iniciacao_cientifica: 'Iniciação Científica',
    outras: 'Outras',
  };

  if (!orientacoesPorNivel || typeof orientacoesPorNivel !== 'object') {
    return {
      series: [
        { name: 'Em Andamento', data: [] },
        { name: 'Concluído', data: [] },
      ],
      categories: [],
    };
  }

  const niveis = Object.keys(nivelLabels).filter((nivel) => {
    const dadosNivel = orientacoesPorNivel[nivel] || {};
    const totalCalculado = (dadosNivel.ativo || 0) + (dadosNivel.concluido || 0);
    const total = Number.isFinite(Number(dadosNivel.total))
      ? Number(dadosNivel.total)
      : totalCalculado;

    return total > 0;
  });

  const ativoData = niveis.map((n) => (orientacoesPorNivel[n]?.ativo || 0));
  const concluidoData = niveis.map((n) => (orientacoesPorNivel[n]?.concluido || 0));
  const categories = niveis.map((n) => nivelLabels[n]);

  return {
    series: [
      { name: 'Em Andamento', data: ativoData },
      { name: 'Concluído', data: concluidoData },
    ],
    categories,
  };
};

/**
 * Obtém informações do docente
 * @param {Object} docente - Objeto do docente
 * @returns {Object} Informações processadas
 */
export const getDocenteInfo = (docente) => {
  if (!docente || !docente.lattes) return null;
  
  const lattes = docente.lattes;
  
  return {
    nome: docente.docente || lattes.docente?.nome || 'Desconhecido',
    formacao: lattes.formacao || [],
    producoes: lattes.producoes || [],
    orientacoes: lattes.orientacoes || {},
    projetos: lattes.projetos || []
  };
};

/**
 * Carrega dados do JSON de Lattes
 * @returns {Promise<Object>} Dados do JSON
 */
export const loadLattesData = async () => {
  try {
    return curriculosData;
  } catch (error) {
    console.error('Erro ao carregar dados de Lattes:', error);
    return null;
  }
};

/**
 * Obtém lista de todos os docentes
 * @param {Object} data - Dados do JSON
 * @returns {Array} Lista de docentes
 */
export const getListaDocentes = (data) => {
  if (!data || !Array.isArray(data.registros)) return [];
  
  const docentes = data.registros.map(reg => ({
    id: reg.docente,
    nome: reg.docente,
    label: reg.docente
  }));
  
  // Ordena alfabeticamente por nome
  return docentes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
};

/**
 * Encontra um docente pelos dados
 * @param {Object} data - Dados do JSON
 * @param {string} nome - Nome do docente
 * @returns {Object} Dados do docente
 */
export const findDocente = (data, nome) => {
  if (!data || !Array.isArray(data.registros)) return null;
  return data.registros.find(reg => reg.docente === nome);
};

/**
 * Obtém todos os anos de produção disponíveis no dataset
 * @param {Object} data - Dados do JSON
 * @returns {number[]} Anos ordenados de forma crescente
 */
export const getAnosProducoes = (data) => {
  if (!data || !Array.isArray(data.registros)) return [];

  const anos = new Set();

  data.registros.forEach((registro) => {
    const producoes = registro?.lattes?.producoes;
    if (!Array.isArray(producoes)) return;

    producoes.forEach((producao) => {
      const ano = Number.parseInt(producao?.ano, 10);
      if (Number.isFinite(ano)) {
        anos.add(ano);
      }
    });
  });

  return Array.from(anos).sort((a, b) => a - b);
};

/**
 * Obtém os anos iniciais de quadriênios possíveis
 * @param {number[]} anos - Lista de anos disponíveis
 * @param {number|null} limiteInicio - Ano mínimo permitido para início do quadriênio
 * @param {number|null} limiteFim - Ano máximo permitido para fim do quadriênio
 * @returns {number[]} Anos iniciais ordenados
 */
export const getQuadrieniosDisponiveis = (anos, limiteInicio = null, limiteFim = null) => {
  if (!Array.isArray(anos) || anos.length < 4) return [];

  const minAno = Math.min(...anos);
  const maxAno = Math.max(...anos);

  const minPermitido = Number.isFinite(Number.parseInt(limiteInicio, 10))
    ? Number.parseInt(limiteInicio, 10)
    : minAno;

  const maxPermitido = Number.isFinite(Number.parseInt(limiteFim, 10))
    ? Number.parseInt(limiteFim, 10)
    : maxAno;

  const inicioFaixa = Math.max(minAno, minPermitido);
  const fimFaixa = Math.min(maxAno, maxPermitido);

  if (inicioFaixa > fimFaixa || inicioFaixa + 3 > fimFaixa) return [];

  const quadrienios = [];

  for (let ano = inicioFaixa; ano <= fimFaixa - 3; ano += 1) {
    quadrienios.push(ano);
  }

  return quadrienios;
};

/**
 * Processa produções por docente em um quadriênio para barras empilhadas
 * @param {Object} data - Dados do JSON
 * @param {number} anoInicio - Ano inicial do quadriênio
 * @returns {{categories: string[], series: Array<{name: string, data: number[]}>, anos: number[], totalProducoes: number, docentesAtivos: number}}
 */
export const processProducoesPorDocenteQuadrienio = (data, anoInicio) => {
  const anoInicial = Number.parseInt(anoInicio, 10);

  if (!data || !Array.isArray(data.registros) || !Number.isFinite(anoInicial)) {
    return {
      categories: [],
      series: [],
      anos: [],
      totalProducoes: 0,
      docentesAtivos: 0,
    };
  }

  const anos = [anoInicial, anoInicial + 1, anoInicial + 2, anoInicial + 3];

  const docentes = data.registros.map((registro) => {
    const nome = registro?.docente || registro?.lattes?.docente?.nome || 'Docente não informado';
    const counts = anos.reduce((acc, ano) => ({ ...acc, [ano]: 0 }), {});

    const producoes = registro?.lattes?.producoes;
    if (Array.isArray(producoes)) {
      producoes.forEach((producao) => {
        const ano = Number.parseInt(producao?.ano, 10);
        if (anos.includes(ano)) {
          counts[ano] += 1;
        }
      });
    }

    const total = anos.reduce((sum, ano) => sum + counts[ano], 0);

    return {
      nome,
      counts,
      total,
    };
  });

  docentes.sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));

  const categories = docentes.map((docente) => docente.nome);
  const series = anos.map((ano) => ({
    name: `${ano}`,
    data: docentes.map((docente) => docente.counts[ano] || 0),
  }));

  return {
    categories,
    series,
    anos,
    totalProducoes: docentes.reduce((sum, docente) => sum + docente.total, 0),
    docentesAtivos: docentes.filter((docente) => docente.total > 0).length,
  };
};

/**
 * Processa dados para curva de Pareto da produção por docente no quadriênio
 * @param {Object} data - Dados do JSON
 * @param {number} anoInicio - Ano inicial do quadriênio
 * @returns {{categories: string[], producoes: number[], acumuladoPercentual: number[], totalProducoes: number, docentesAtivos: number, docentesPareto80: number}}
 */
export const processParetoProducoesPorDocenteQuadrienio = (data, anoInicio) => {
  const base = processProducoesPorDocenteQuadrienio(data, anoInicio);

  if (!base.categories.length || !base.series.length) {
    return {
      categories: [],
      producoes: [],
      acumuladoPercentual: [],
      totalProducoes: 0,
      docentesAtivos: 0,
      docentesPareto80: 0,
    };
  }

  const docentes = base.categories.map((nome, index) => {
    const total = base.series.reduce((sum, serie) => sum + (serie.data[index] || 0), 0);
    return { nome, total };
  }).filter((docente) => docente.total > 0);

  const totalProducoes = docentes.reduce((sum, docente) => sum + docente.total, 0);

  if (totalProducoes === 0) {
    return {
      categories: [],
      producoes: [],
      acumuladoPercentual: [],
      totalProducoes: 0,
      docentesAtivos: 0,
      docentesPareto80: 0,
    };
  }

  let acumulado = 0;
  let docentesPareto80 = 0;

  const acumuladoPercentual = docentes.map((docente, index) => {
    acumulado += docente.total;
    const percentual = Number(((acumulado / totalProducoes) * 100).toFixed(2));
    if (percentual <= 80 || (percentual > 80 && docentesPareto80 === index)) {
      docentesPareto80 = index + 1;
    }
    return percentual;
  });

  return {
    categories: docentes.map((docente) => docente.nome),
    producoes: docentes.map((docente) => docente.total),
    acumuladoPercentual,
    totalProducoes,
    docentesAtivos: docentes.length,
    docentesPareto80,
  };
};

/**
 * Processa dados para scatter plot de produção × orientações concluídas
 * @param {Object} data - Dados do JSON com todos os docentes
 * @returns {Object} Dados processados com { docentesData: Array, maxProducoes, maxOrientacoes }
 */
export const processProducaoOrientacoesScatter = (data) => {
  if (!data || !Array.isArray(data.registros)) {
    return {
      docentesData: [],
      maxProducoes: 0,
      maxOrientacoes: 0,
      totalDocentes: 0,
      docentesComDados: 0,
    };
  }

  const docentesData = data.registros.map((reg) => {
    const docente = findDocente(data, reg.docente);
    if (!docente) {
      return null;
    }

    const info = getDocenteInfo(docente);
    if (!info) {
      return null;
    }
    const totalProducoes = Array.isArray(info.producoes) ? info.producoes.length : 0;

    let totalOrientacoesConcluidas = 0;
    if (info.orientacoes && typeof info.orientacoes === 'object') {
      const niveis = ['mestrado', 'doutorado', 'pos_doutorado', 'iniciacao_cientifica', 'outras'];
      niveis.forEach((nivel) => {
        const list = info.orientacoes[nivel] || [];
        if (Array.isArray(list)) {
          list.forEach((orient) => {
            const situacao = (orient.situacao || orient.status || 'Concluído').toString().toLowerCase();
            if (
              !situacao.includes('andamento') &&
              !situacao.includes('em-andamento') &&
              !situacao.includes('em andamento')
            ) {
              totalOrientacoesConcluidas += 1;
            }
          });
        }
      });
    }

    return {
      nome: reg.docente,
      producoes: totalProducoes,
      orientacoes: totalOrientacoesConcluidas,
    };
  }).filter((item) => item !== null && (item.producoes > 0 || item.orientacoes > 0));

  const maxProducoes = docentesData.length > 0 ? Math.max(...docentesData.map((d) => d.producoes), 0) : 0;
  const maxOrientacoes = docentesData.length > 0 ? Math.max(...docentesData.map((d) => d.orientacoes), 0) : 0;

  return {
    docentesData,
    maxProducoes,
    maxOrientacoes,
    totalDocentes: data.registros.length,
    docentesComDados: docentesData.length,
  };
};

/**
 * Processa dados para scatter plot de um docente específico: produção por ano × orientações concluídas por ano
 * @param {Object} docente - Objeto do docente
 * @returns {Object} Dados processados com { docenteData: Array, maxProducoes, maxOrientacoes }
 */
export const processProducaoOrientacoesDocenteScatter = (docente) => {
  if (!docente || !docente.lattes) {
    return {
      docenteData: [],
      maxProducoes: 0,
      maxOrientacoes: 0,
      nome: 'Desconhecido',
    };
  }

  const info = getDocenteInfo(docente);
  if (!info) {
    return {
      docenteData: [],
      maxProducoes: 0,
      maxOrientacoes: 0,
      nome: 'Desconhecido',
    };
  }

  const producoesPorAno = {};
  if (Array.isArray(info.producoes)) {
    info.producoes.forEach((prod) => {
      const ano = prod.ano || new Date().getFullYear();
      producoesPorAno[ano] = (producoesPorAno[ano] || 0) + 1;
    });
  }

  const orientacoesConcluiPorAno = {};
  if (info.orientacoes && typeof info.orientacoes === 'object') {
    const niveis = ['mestrado', 'doutorado', 'pos_doutorado', 'iniciacao_cientifica', 'outras'];
    niveis.forEach((nivel) => {
      const list = info.orientacoes[nivel] || [];
      if (Array.isArray(list)) {
        list.forEach((orient) => {
          const situacao = (orient.situacao || orient.status || 'Concluído').toString().toLowerCase();
          if (
            !situacao.includes('andamento') &&
            !situacao.includes('em-andamento') &&
            !situacao.includes('em andamento')
          ) {
            const ano = orient.ano || orient.ano_fim || new Date().getFullYear();
            orientacoesConcluiPorAno[ano] = (orientacoesConcluiPorAno[ano] || 0) + 1;
          }
        });
      }
    });
  }

  const todosAnosSet = new Set([...Object.keys(producoesPorAno), ...Object.keys(orientacoesConcluiPorAno)]);
  const todosAnos = Array.from(todosAnosSet).map((a) => parseInt(a)).sort((a, b) => a - b);

  const docenteData = todosAnos
    .map((ano) => ({
      x: producoesPorAno[ano] || 0,
      y: orientacoesConcluiPorAno[ano] || 0,
      ano,
    }))
    .filter((item) => item.x > 0 || item.y > 0);

  const maxProducoes = docenteData.length > 0 ? Math.max(...docenteData.map((d) => d.x), 0) : 0;
  const maxOrientacoes = docenteData.length > 0 ? Math.max(...docenteData.map((d) => d.y), 0) : 0;

  return {
    docenteData,
    maxProducoes,
    maxOrientacoes,
    nome: info.nome,
  };
};
