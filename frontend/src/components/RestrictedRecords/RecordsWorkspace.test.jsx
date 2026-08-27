import { act, fireEvent, render, screen } from '@testing-library/react';
import RecordsWorkspace from './RecordsWorkspace';

describe('painel de registros privados', () => {
  it('carrega e atualiza as sugestões do docente', async () => {
    const request = jest.fn().mockResolvedValue([]);

    render(<RecordsWorkspace isCoordination={false} request={request} />);

    expect(await screen.findByText('Nenhuma sugestão registrada.')).toBeTruthy();
    expect(request).toHaveBeenCalledWith('/api/suggestions/mine');

    const refreshButton = screen.getByRole('button', { name: 'Atualizar' });
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    const suggestionCalls = request.mock.calls
      .filter(([path]) => path === '/api/suggestions/mine');
    expect(suggestionCalls).toHaveLength(2);
  });
});
