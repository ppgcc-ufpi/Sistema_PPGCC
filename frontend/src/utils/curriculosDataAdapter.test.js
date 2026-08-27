import { buildCurriculosData } from './curriculosDataAdapter';

const docentes = [
  { id_docente: 'a', nome: 'Docente A' },
  { id_docente: 'b', nome: 'Docente B' },
];
const producoes = [
  { id_producao: 'p1', docente_ids: ['a', 'b'], natureza: 'bibliografica', vinculo_programa: { integrar: true } },
  { id_producao: 'p2', docente_ids: ['a'], natureza: 'tecnica', vinculo_programa: { integrar: false } },
];
const orientacoes = [
  { id_orientacao: 'o1', docente_ids: ['a'], nivel_normalizado: 'mestrado', situacao_normalizada: 'concluido', vinculo_programa: { integrar: true } },
  { id_orientacao: 'o2', docente_ids: ['b'], nivel_normalizado: 'doutorado', situacao_normalizada: 'em_andamento', vinculo_programa: { integrar: true } },
  { id_orientacao: 'o3', docente_ids: ['a'], nivel_normalizado: 'mestrado', situacao_normalizada: 'desligado', vinculo_programa: { integrar: true } },
];
const projetos = [
  { id_projeto: 'r1', docente_ids: ['a', 'b'], situacao_normalizada: 'em_andamento', vinculo_programa: { integrar: true } },
  { id_projeto: 'r2', docente_ids: ['a'], situacao_normalizada: 'concluido', vinculo_programa: { integrar: false } },
];
const formacoes = [
  { id_formacao: 'f1', id_docente: 'a' },
  { id_formacao: 'f2', id_docente: 'b' },
];
const curriculosData = buildCurriculosData({
  docentes, producoes, orientacoes, projetos, formacoes,
});

const totalVinculos = (itens) => itens.reduce(
  (total, item) => total + (item.docente_ids || []).length,
  0
);

const integraveis = (itens) => itens.filter(
  (item) => item.vinculo_programa?.integrar === true
);

const SITUACOES_ORIENTACAO_DASHBOARD = new Set(['em_andamento', 'concluido']);
const orientacoesExibiveis = orientacoes.filter((item) => (
  item.vinculo_programa?.integrar === true
  && SITUACOES_ORIENTACAO_DASHBOARD.has(item.situacao_normalizada)
));

describe('curriculosDataAdapter', () => {
  it('monta um registro de dashboard para cada docente', () => {
    expect(curriculosData.registros).toHaveLength(docentes.length);
    expect(new Set(curriculosData.registros.map((item) => item.id_docente)).size)
      .toBe(docentes.length);
  });

  it('preserva todos os vínculos entre dados e docentes', () => {
    const total = (campo) => curriculosData.registros.reduce(
      (soma, registro) => soma + registro.lattes[campo].length,
      0
    );
    const totalOrientacoes = curriculosData.registros.reduce(
      (soma, registro) => soma + Object.values(registro.lattes.orientacoes)
        .reduce((subtotal, itens) => subtotal + itens.length, 0),
      0
    );

    expect(total('producoes')).toBe(totalVinculos(integraveis(producoes)));
    expect(totalOrientacoes).toBe(totalVinculos(orientacoesExibiveis));
    expect(total('projetos')).toBe(totalVinculos(integraveis(projetos)));
    expect(total('formacao')).toBe(formacoes.length);
  });

  it('não envia orientações desligadas ou abandonadas aos dashboards', () => {
    const orientacoesExcluidas = orientacoes.filter((item) => (
      item.vinculo_programa?.integrar === true
      && ['desligado', 'abandonado'].includes(item.situacao_normalizada)
    ));
    const orientacoesDashboard = curriculosData.registros
      .flatMap((registro) => Object.values(registro.lattes.orientacoes).flat());

    expect(orientacoesExcluidas.length).toBeGreaterThan(0);
    expect(orientacoesDashboard.every((item) => (
      SITUACOES_ORIENTACAO_DASHBOARD.has(item.situacao_normalizada)
    ))).toBe(true);
  });

  it('exclui dos dashboards os dados sem vínculo com o programa', () => {
    curriculosData.registros.forEach((registro) => {
      expect(registro.lattes.producoes.every(
        (item) => item.vinculo_programa?.integrar === true
      )).toBe(true);
      expect(Object.values(registro.lattes.orientacoes).flat().every(
        (item) => item.vinculo_programa?.integrar === true
      )).toBe(true);
      expect(registro.lattes.projetos.every(
        (item) => item.vinculo_programa?.integrar === true
      )).toBe(true);
    });
  });

  it('entrega os campos normalizados esperados pelos gráficos', () => {
    curriculosData.registros.forEach((registro) => {
      expect(Object.keys(registro.lattes.orientacoes)).toEqual([
        'mestrado',
        'doutorado',
        'pos_doutorado',
        'iniciacao_cientifica',
        'outras',
      ]);
      registro.lattes.producoes.forEach((item) => expect(item.tipo).toBeTruthy());
      registro.lattes.projetos.forEach((item) => expect(item.situacao).toBeTruthy());
    });
  });
});
