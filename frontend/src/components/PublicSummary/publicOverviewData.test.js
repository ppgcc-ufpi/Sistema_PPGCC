import {
  buildAnnualActivity,
  buildCategorySeries,
  buildFacultyMembership,
  buildProductionByYear,
  buildStackedByYear,
  formatCategory,
} from './publicOverviewData';

describe('dados da visão geral pública', () => {
  it('consolida a atividade por ano usando os campos de cada entidade', () => {
    expect(buildAnnualActivity({
      producoes: [{ ano: 2023 }, { ano: 2024 }, { ano: 2024 }],
      orientacoes: [{ ano: 2024 }],
      projetos: [{ ano_inicio: 2023 }],
    })).toEqual({
      years: ['2023', '2024'],
      series: [
        { name: 'Produções', data: [1, 2] },
        { name: 'Orientações', data: [0, 1] },
        { name: 'Projetos iniciados', data: [1, 0] },
      ],
    });
  });

  it('agrupa categorias menores em Outros', () => {
    const result = buildCategorySeries([
      { natureza: 'artigo' }, { natureza: 'artigo' }, { natureza: 'livro' },
      { natureza: 'patente' }, { natureza: 'software' },
    ], 'natureza', 3);
    expect(result).toEqual({ labels: ['Artigo', 'Livro', 'Outros'], series: [2, 1, 2] });
  });

  it('formata valores normalizados para apresentação', () => {
    expect(formatCategory('EM_ANDAMENTO')).toBe('Em Andamento');
    expect(formatCategory(null)).toBe('Não informado');
  });

  it('não duplica o mesmo discente na mesma situação e no mesmo ano', () => {
    const result = buildStackedByYear([
      { ano: 2024, nivel_normalizado: 'mestrado', situacao_normalizada: 'em_andamento', orientando_normalizado: 'ana' },
      { ano: 2024, nivel_normalizado: 'mestrado', situacao_normalizada: 'em_andamento', orientando_normalizado: 'ana' },
    ], 'ano', 'situacao_normalizada', {
      filter: (item) => item.nivel_normalizado === 'mestrado',
      identity: (item) => item.orientando_normalizado,
    });
    expect(result).toEqual({ years: ['2024'], series: [{ name: 'Em Andamento', data: [1] }] });
  });

  it('mantém vigente o vínculo docente presente no último Sucupira validado', () => {
    expect(buildFacultyMembership([
      { vinculos_programa: { mestrado: { ano_inicio: 2023, ano_fim: null, categoria: 'permanente' } } },
      { vinculos_programa: { mestrado: { ano_inicio: 2024, ano_fim: 2024, categoria: 'colaborador' } } },
      { vinculos_programa: { mestrado: { ano_inicio: 2023, ano_fim: 2023, categoria: 'permanente' } } },
    ], 2024, 2026)).toEqual({
      years: ['2023', '2024', '2025', '2026'],
      series: [
        { name: 'Permanente', data: [2, 1, 1, 1] },
        { name: 'Colaborador', data: [0, 1, 1, 1] },
      ],
    });
  });

  it('separa a produção técnica e bibliográfica pela classificação integrada', () => {
    const productions = [
      { ano: 2023, natureza: 'PRODUCAO_TECNICA' },
      { ano: 2024, natureza: 'BIBLIOGRAFICA' },
    ];
    expect(buildProductionByYear(productions, 'tecn').series[0].data).toEqual([1, 0]);
    expect(buildProductionByYear(productions, 'bibliograf').series[0].data).toEqual([0, 1]);
  });
});
