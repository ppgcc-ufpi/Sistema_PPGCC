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

  it('combina filtros por docente, ano e tipo de produção na coordenação', async () => {
    const records = [
      {
        entityType: 'PRODUCAO',
        externalId: 'prod-1',
        data: { titulo: 'Artigo de 2026', ano: 2026, natureza: 'bibliografica', tipos: ['Artigo'] },
        faculty: [{ idExterno: 'doc-1', nome: 'Ana Docente' }],
        visibility: { hidden: false, canHide: true, defaultVisible: true },
      },
      {
        entityType: 'PRODUCAO',
        externalId: 'prod-2',
        data: { titulo: 'Software de 2025', ano: 2025, natureza: 'tecnica', tipos: ['Software'] },
        faculty: [{ idExterno: 'doc-2', nome: 'Bruno Docente' }],
        visibility: { hidden: false, canHide: true, defaultVisible: true },
      },
    ];
    const request = jest.fn().mockImplementation((path) => Promise.resolve(
      path.startsWith('/api/records/') ? records : [],
    ));

    render(<RecordsWorkspace isCoordination request={request} />);

    expect(await screen.findByText('Artigo de 2026')).toBeTruthy();
    expect(screen.getByText('Software de 2025')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Docente'), { target: { value: 'doc-1' } });
    expect(screen.getByText('Artigo de 2026')).toBeTruthy();
    expect(screen.queryByText('Software de 2025')).toBeNull();

    fireEvent.change(screen.getByLabelText('Ano'), { target: { value: '2025' } });
    expect(screen.getByText('Nenhum registro corresponde aos filtros.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    fireEvent.change(screen.getByLabelText('Tipo de produção'), { target: { value: 'Software' } });
    expect(screen.queryByText('Artigo de 2026')).toBeNull();
    expect(screen.getByText('Software de 2025')).toBeTruthy();
    expect(screen.getByText('1 de 2 registros')).toBeTruthy();
  });

  it('oferece filtros específicos na visão docente sem permitir selecionar outro docente', async () => {
    const request = jest.fn().mockImplementation((path) => Promise.resolve(
      path.startsWith('/api/records/') ? [{
        entityType: 'PRODUCAO',
        externalId: 'prod-1',
        data: { titulo: 'Produção docente', ano: 2026, natureza: 'tecnica', tipos: ['Software'] },
        visibility: { hidden: false, canHide: true, defaultVisible: true },
      }] : [],
    ));

    render(<RecordsWorkspace isCoordination={false} request={request} />);

    expect(await screen.findByText('Produção docente')).toBeTruthy();
    expect(screen.queryByLabelText('Docente')).toBeNull();
    expect(screen.getByLabelText('Ano')).toBeTruthy();
    expect(screen.getByLabelText('Natureza')).toBeTruthy();
    expect(screen.getByLabelText('Tipo de produção')).toBeTruthy();
  });
});
