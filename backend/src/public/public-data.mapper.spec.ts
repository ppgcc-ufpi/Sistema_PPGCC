import {
  sanitizeFaculty,
  sanitizeAdvising,
  sanitizeProduction,
} from './public-data.mapper';

describe('mapeamento dos dados públicos', () => {
  it('remove fontes internas do docente', () => {
    const resultado = sanitizeFaculty({
      id_docente: 'doc_1',
      nome: 'docente de teste',
      nome_normalizado: 'docente de teste',
      ano_ingresso_programa: 2020,
      vinculos_programa: { mestrado: { ano_inicio: 2020, ano_fim: null, categoria: 'permanente' } },
      fontes: { lattes: 'arquivo-interno.json' },
    });

    expect(resultado).toEqual({
      id_docente: 'doc_1',
      nome: 'DOCENTE DE TESTE',
      ano_ingresso_programa: 2020,
      vinculos_programa: { mestrado: { ano_inicio: 2020, ano_fim: null, categoria: 'permanente' } },
    });
    expect(resultado).not.toHaveProperty('fontes');
    expect(resultado).not.toHaveProperty('nome_normalizado');
  });

  it('remove nomes normalizados aninhados e apresenta nomes em caixa alta', () => {
    const resultado = sanitizeProduction({
      id_producao: 'prod_2',
      titulo: 'Artigo',
      autores: [{ nome: 'Maria da Silva', nome_normalizado: 'maria da silva' }],
    });
    expect(resultado).toMatchObject({ autores: [{ nome: 'MARIA DA SILVA' }] });
    expect(resultado).not.toHaveProperty('autores.0.nome_normalizado');
  });

  it('remove controle e evidências internas da produção', () => {
    const resultado = sanitizeProduction({
      id_producao: 'prod_1',
      titulo: 'Produção pública',
      controle_dashboard: { revisao_recomendada: true },
      vinculo_programa: { integrar: true, evidencias: ['registro_interno'] },
      fontes: { bases: ['lattes'] },
    });

    expect(resultado).toEqual({
      id_producao: 'prod_1',
      titulo: 'Produção pública',
      vinculo_programa: { integrar: true },
    });
    expect(resultado).not.toHaveProperty('controle_dashboard');
    expect(resultado).not.toHaveProperty('fontes');
  });

  it('preserva o contrato usado pelos dashboards de orientações', () => {
    const resultado = sanitizeAdvising({
      id_orientacao: 'ori_1',
      docente_ids: ['doc_1'],
      situacao_normalizada: 'concluido',
      fontes: ['lattes'],
    });

    expect(resultado).toMatchObject({
      id_orientacao: 'ori_1',
      docente_ids: ['doc_1'],
      situacao_normalizada: 'concluido',
      vinculo_programa: { integrar: true },
    });
    expect(resultado).not.toHaveProperty('fontes');
  });
});
