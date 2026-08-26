import { applyChanges } from './effective-data';

describe('camada de correções aprovadas', () => {
  it('aplica alterações sem modificar os dados importados', () => {
    const original = { titulo: 'Original', detalhes: { ano: 2024, fonte: 'lattes' } };
    const resultado = applyChanges(original, { titulo: 'Corrigido', detalhes: { ano: 2025 } });
    expect(resultado).toEqual({ titulo: 'Corrigido', detalhes: { ano: 2025, fonte: 'lattes' } });
    expect(original.titulo).toBe('Original');
  });

  it('remove um campo quando a correção usa null', () => {
    expect(applyChanges({ titulo: 'Item', observacao: 'remover' }, { observacao: null }))
      .toEqual({ titulo: 'Item' });
  });

  it('ignora chaves capazes de alterar o protótipo', () => {
    const alteracoes = JSON.parse('{"__proto__":{"administrador":true}}') as Record<string, unknown>;
    const resultado = applyChanges({ titulo: 'Seguro' }, alteracoes);
    expect(resultado).toEqual({ titulo: 'Seguro' });
    expect(({} as { administrador?: boolean }).administrador).toBeUndefined();
  });
});
