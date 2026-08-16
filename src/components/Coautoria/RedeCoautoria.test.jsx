import { fireEvent, render, screen } from '@testing-library/react';
import RedeCoautoria from './RedeCoautoria';

describe('RedeCoautoria', () => {
  it('exibe as produções ao selecionar uma colaboração na visão do docente', () => {
    render(<RedeCoautoria />);

    fireEvent.change(screen.getByLabelText('Docente em destaque'), {
      target: { value: 'doc_9f78268945de8352' },
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
