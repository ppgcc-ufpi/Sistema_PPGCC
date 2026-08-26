import {
  prepareDadosOrientacoesPorNivel,
  processOrientacoes,
  processOrientacoesPorNivel,
} from './lattesDataProcessor';

describe('orientações por nível', () => {
  it('mantém no gráfico somente níveis que possuem orientações', () => {
    const dados = processOrientacoesPorNivel({
      mestrado: [
        { situacao: 'Concluído' },
        { situacao: 'Em andamento' },
      ],
      doutorado: [{ situacao: 'Concluído' }],
      pos_doutorado: [],
      iniciacao_cientifica: [],
      outras: [],
    });

    expect(prepareDadosOrientacoesPorNivel(dados)).toEqual({
      series: [
        { name: 'Em Andamento', data: [1, 0] },
        { name: 'Concluído', data: [1, 1] },
      ],
      categories: ['Mestrado', 'Doutorado'],
    });
  });

  it('mantém orientações em andamento nos anos posteriores ao início', () => {
    const resultado = processOrientacoes({
      mestrado: [
        { ano: 2024, anos_registrados: [2024], situacao: 'Em andamento' },
        { ano: 2025, anos_registrados: [2023, 2025], situacao: 'Concluído' },
      ],
      doutorado: [
        { ano: 2026, anos_registrados: [2023, 2026], situacao: 'Em andamento' },
      ],
    }, 2026);

    expect(resultado).toEqual({
      2023: { ativo: 1, concluido: 0, total: 1 },
      2024: { ativo: 2, concluido: 0, total: 2 },
      2025: { ativo: 2, concluido: 1, total: 3 },
      2026: { ativo: 2, concluido: 0, total: 2 },
    });
  });

  it('exibe pós-doutorado quando houver orientação neste nível', () => {
    const resultado = prepareDadosOrientacoesPorNivel({
      mestrado: { ativo: 0, concluido: 0, total: 0 },
      pos_doutorado: { ativo: 1, concluido: 0, total: 1 },
    });

    expect(resultado.categories).toEqual(['Pós-Doutorado']);
    expect(resultado.series[0].data).toEqual([1]);
    expect(resultado.series[1].data).toEqual([0]);
  });
});
