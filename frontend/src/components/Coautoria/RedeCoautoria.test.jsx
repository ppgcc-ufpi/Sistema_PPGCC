import { fireEvent, render, screen } from '@testing-library/react';
import RedeCoautoria from './RedeCoautoria';

describe('RedeCoautoria', () => {
  it('exibe as produções ao selecionar uma colaboração na visão do docente', () => {
    const docentes = [
      { id_docente: 'a', nome: 'Docente A', vinculo_institucional: { categoria: 'permanente' } },
      { id_docente: 'b', nome: 'Guilherme Amaral Avelino', vinculo_institucional: { categoria: 'permanente' } },
    ];
    const producoes = Array.from({ length: 6 }, (_, index) => ({
      id_producao: `p${index + 1}`,
      titulo: index === 0 ? 'DataCoin: Dataset Sazonal' : `Produção compartilhada ${index + 1}`,
      ano: 2025,
      natureza: 'bibliografica',
      docente_ids: ['a', 'b'],
      vinculo_programa: { integrar: true },
    }));

    render(<RedeCoautoria data={{ docentes, producoes }} />);

    fireEvent.change(screen.getByLabelText('Docente em destaque'), {
      target: { value: 'a' },
    });

    expect(screen.getByText('Principais colaborações')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {
      name: /Guilherme Amaral Avelino 6/i,
    }));

    expect(screen.getByText('Produções compartilhadas')).toBeTruthy();
    expect(screen.getByText((_, elemento) => (
      elemento.classList.contains('detalhes-resumo')
      && elemento.textContent.includes('6 produções em conjunto no período')
    ))).toBeTruthy();
    expect(screen.getByText(/DataCoin: Dataset Sazonal/i)).toBeTruthy();
  });
});
