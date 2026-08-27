import { buildCoauthorshipGraph } from './coautoriaDataProcessor';

describe('coautoriaDataProcessor', () => {
  const docentesFixture = [
    { id_docente: 'a', nome: 'Docente A', vinculo_institucional: { categoria: 'permanente' } },
    { id_docente: 'b', nome: 'Docente B', vinculo_institucional: { categoria: 'permanente' } },
    { id_docente: 'c', nome: 'Docente C', vinculo_institucional: { categoria: 'colaborador' } },
  ];

  const producoesFixture = [
    {
      id_producao: 'p1', titulo: 'Produção 1', ano: 2024, natureza: 'bibliografica',
      docente_ids: ['a', 'b', 'c'], vinculo_programa: { integrar: true },
    },
    {
      id_producao: 'p2', titulo: 'Produção 2', ano: 2025, natureza: 'tecnica',
      docente_ids: ['a', 'b'], vinculo_programa: { integrar: true },
    },
    {
      id_producao: 'p3', titulo: 'Fora do programa', ano: 2025, natureza: 'bibliografica',
      docente_ids: ['b', 'c'], vinculo_programa: { integrar: false },
    },
  ];

  it('cria todas as combinações de pares e acumula seus pesos', () => {
    const grafo = buildCoauthorshipGraph({
      docentes: docentesFixture,
      producoes: producoesFixture,
      anoInicial: 2024,
      anoFinal: 2025,
    });

    expect(grafo.arestas).toHaveLength(3);
    expect(grafo.arestas.find((aresta) => aresta.id === 'a|b').peso).toBe(2);
    expect(grafo.estatisticas.producoesComCoautoria).toBe(2);
    expect(grafo.estatisticas.totalVinculos).toBe(4);
  });

  it('aplica período, natureza e peso mínimo', () => {
    const grafo = buildCoauthorshipGraph({
      docentes: docentesFixture,
      producoes: producoesFixture,
      anoInicial: 2025,
      anoFinal: 2025,
      natureza: 'tecnica',
      pesoMinimo: 1,
    });

    expect(grafo.arestas.map((aresta) => aresta.id)).toEqual(['a|b']);
    expect(grafo.estatisticas.totalProducoes).toBe(1);
  });

  it('ignora identificadores desconhecidos e IDs repetidos na mesma produção', () => {
    const grafo = buildCoauthorshipGraph({
      docentes: docentesFixture,
      producoes: [{
        ...producoesFixture[0],
        docente_ids: ['a', 'a', 'desconhecido', 'b'],
      }],
      anoInicial: 2024,
      anoFinal: 2024,
    });

    expect(grafo.arestas).toHaveLength(1);
    expect(grafo.arestas[0].peso).toBe(1);
  });
});
