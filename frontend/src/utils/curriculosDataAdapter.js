import docentes from '../data/docentes.json';
import producoes from '../data/producoes.json';
import orientacoes from '../data/orientacoes.json';
import projetos from '../data/projetos.json';
import formacoes from '../data/formacoes.json';

const PARTICULAS_NOME = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);
const TIPOS_GENERICOS = new Set(['bibliografica', 'tecnica']);
const SITUACOES_ORIENTACAO_DASHBOARD = new Set(['em_andamento', 'concluido']);

const formatarNome = (nome = '') => nome
  .trim()
  .toLocaleLowerCase('pt-BR')
  .split(/\s+/)
  .map((parte, index) => (
    index > 0 && PARTICULAS_NOME.has(parte)
      ? parte
      : `${parte.charAt(0).toLocaleUpperCase('pt-BR')}${parte.slice(1)}`
  ))
  .join(' ');

const normalizarTexto = (valor = '') => valor
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR');

const indexarPorDocente = (itens, obterIds) => {
  const indice = new Map();

  itens.forEach((item) => {
    obterIds(item).forEach((idDocente) => {
      if (!indice.has(idDocente)) indice.set(idDocente, []);
      indice.get(idDocente).push(item);
    });
  });

  return indice;
};

const obterTipoProducao = (producao) => {
  const tipos = Array.isArray(producao.tipos) ? producao.tipos.filter(Boolean) : [];
  const tipoEspecifico = tipos.find((tipo) => !TIPOS_GENERICOS.has(normalizarTexto(tipo)));

  if (tipoEspecifico) return tipoEspecifico;
  if (tipos.length > 0) return tipos[0];
  if (producao.natureza) return formatarNome(producao.natureza);
  return 'Tipo não informado';
};

const adaptarProducao = (producao) => ({
  ...producao,
  tipo: obterTipoProducao(producao),
});

const obterNivelOrientacao = (orientacao) => {
  const nivel = normalizarTexto(orientacao.nivel_normalizado).replace(/\s+/g, '_');
  const tipos = (orientacao.tipos || []).map(normalizarTexto).join(' ');

  if (nivel === 'mestrado' || nivel === 'doutorado' || nivel === 'pos_doutorado') {
    return nivel;
  }

  if (nivel === 'iniciacao_cientifica' || tipos.includes('iniciacao cientifica')) {
    return 'iniciacao_cientifica';
  }

  return 'outras';
};

const adaptarOrientacao = (orientacao) => ({
  ...orientacao,
  situacao: orientacao.situacao_normalizada === 'em_andamento'
    ? 'Em andamento'
    : 'Concluído',
});

const adaptarProjeto = (projeto) => ({
  ...projeto,
  ano_fim: projeto.ano_conclusao,
  situacao: projeto.situacao_normalizada === 'em_andamento'
    ? 'Em andamento'
    : 'Concluído',
});

const deveIntegrar = (item) => item?.vinculo_programa?.integrar === true;
const deveExibirOrientacao = (item) => (
  deveIntegrar(item)
  && SITUACOES_ORIENTACAO_DASHBOARD.has(item?.situacao_normalizada)
);

const producoesPorDocente = indexarPorDocente(
  producoes.filter(deveIntegrar),
  (item) => item.docente_ids || []
);
const orientacoesPorDocente = indexarPorDocente(
  orientacoes.filter(deveExibirOrientacao),
  (item) => item.docente_ids || []
);
const projetosPorDocente = indexarPorDocente(
  projetos.filter(deveIntegrar),
  (item) => item.docente_ids || []
);
const formacoesPorDocente = indexarPorDocente(formacoes, (item) => (
  item.id_docente ? [item.id_docente] : []
));

const montarOrientacoes = (itens) => {
  const porNivel = {
    mestrado: [],
    doutorado: [],
    pos_doutorado: [],
    iniciacao_cientifica: [],
    outras: [],
  };

  itens.forEach((orientacao) => {
    porNivel[obterNivelOrientacao(orientacao)].push(adaptarOrientacao(orientacao));
  });

  return porNivel;
};

/**
 * Converte os cinco conjuntos integrados para o contrato consumido pelos
 * dashboards de currículos. Registros compartilhados são atribuídos a cada
 * docente listado em `docente_ids`.
 */
export const curriculosData = {
  registros: docentes.map((docente) => {
    const nome = formatarNome(docente.nome);
    const producoesDocente = producoesPorDocente.get(docente.id_docente) || [];
    const orientacoesDocente = orientacoesPorDocente.get(docente.id_docente) || [];
    const projetosDocente = projetosPorDocente.get(docente.id_docente) || [];
    const formacoesDocente = formacoesPorDocente.get(docente.id_docente) || [];

    return {
      id_docente: docente.id_docente,
      docente: nome,
      dados_docente: docente,
      lattes: {
        docente: {
          id: docente.id_docente,
          nome,
        },
        formacao: formacoesDocente,
        producoes: producoesDocente.map(adaptarProducao),
        orientacoes: montarOrientacoes(orientacoesDocente),
        projetos: projetosDocente.map(adaptarProjeto),
      },
    };
  }),
};

export default curriculosData;
