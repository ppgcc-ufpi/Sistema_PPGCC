// Funções para processar dados do JSON de Lattes
import lattesData from '../data/lattes_sucupira_integrado.json';

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
 * Obtém informações do docente
 * @param {Object} docente - Objeto do docente
 * @returns {Object} Informações processadas
 */
export const getDocenteInfo = (docente) => {
  if (!docente || !docente.lattes) return null;
  
  const lattes = docente.lattes;
  
  return {
    nome: docente.docente || lattes.docente?.nome || 'Desconhecido',
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
    // Retorna os dados importados diretamente
    return lattesData;
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
