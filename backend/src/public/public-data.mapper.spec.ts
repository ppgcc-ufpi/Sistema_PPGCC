import {
  sanitizarDocente,
  sanitizarOrientacao,
  sanitizarProducao,
} from './public-data.mapper';

describe('mapeamento dos dados públicos', () => {
  it('remove fontes internas do docente', () => {
    const resultado = sanitizarDocente({
      id_docente: 'doc_1',
      nome: 'Docente',
      fontes: { lattes: 'arquivo-interno.json' },
    });

    expect(resultado).toEqual({ id_docente: 'doc_1', nome: 'Docente' });
    expect(resultado).not.toHaveProperty('fontes');
  });

  it('remove controle e evidências internas da produção', () => {
    const resultado = sanitizarProducao({
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
    const resultado = sanitizarOrientacao({
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
