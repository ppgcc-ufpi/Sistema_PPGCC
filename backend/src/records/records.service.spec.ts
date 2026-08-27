import { PerfilUsuario as UserRole, TipoEntidade as EntityType } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CorrectionsService } from '../corrections/corrections.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecordsService } from './records.service';

const facultyUser: AuthenticatedUser = {
  id: 'user-1',
  programaId: 'program-1',
  docenteId: 'faculty-1',
  email: 'faculty@example.com',
  nome: 'Docente',
  perfil: UserRole.DOCENTE,
  ativo: true,
};

describe('registros privados', () => {
  const materialize = jest.fn((
    _programId: string,
    _type: EntityType,
    records: Array<{ dadosOriginais: unknown }>,
  ): Promise<Record<string, unknown>[]> => Promise.resolve(
    records.map((record) => record.dadosOriginais as Record<string, unknown>),
  ));
  const prisma = {
    producaoDocente: { findMany: jest.fn() },
    producao: { findMany: jest.fn() },
  };
  const service = new RecordsService(
    prisma as unknown as PrismaService,
    { materialize } as unknown as CorrectionsService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('inclui registros ocultos elegíveis na gestão do docente', async () => {
    prisma.producaoDocente.findMany.mockResolvedValue([{
      producaoId: 'internal-1', docenteId: 'faculty-1', elegivelDocente: true,
      exibirPorPadrao: true, permiteOcultar: true, ocultaDocente: true,
      ocultadaPorId: 'user-1', ocultadaEm: new Date(),
      producao: {
        idExterno: 'prod-1',
        dadosOriginais: { titulo: 'Artigo corrigível', fontes: { arquivo: 'interno.json' } },
        ocultaCoordenacao: false,
      },
    }]);

    const result = await service.forFaculty(facultyUser, EntityType.PRODUCAO);

    expect(prisma.producaoDocente.findMany).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]?.externalId).toBe('prod-1');
    expect(result[0]?.data).toEqual({ titulo: 'Artigo corrigível' });
    expect(result[0]?.data).not.toHaveProperty('fontes');
    expect(result[0]?.visibility.hidden).toBe(true);
    expect(result[0]?.visibility.canHide).toBe(true);
  });

  it('entrega à coordenação as flags privadas e públicas sem excluir ocultos', async () => {
    prisma.producao.findMany.mockResolvedValue([{
      idExterno: 'prod-2', dadosOriginais: { titulo: 'Produção do programa' },
      elegivelCoordenacao: true, elegivelPublico: true,
      exibirPorPadraoCoordenacao: true, exibirPorPadraoPublico: false,
      permiteOcultarCoordenacao: true, ocultaCoordenacao: true,
      docentes: [{ docente: { idExterno: 'doc-1', nome: 'Docente Um' } }],
    }]);

    const result = await service.forCoordination(
      { ...facultyUser, perfil: UserRole.COORDENACAO, docenteId: null },
      EntityType.PRODUCAO,
    );

    expect(prisma.producao.findMany).toHaveBeenCalledTimes(1);
    expect(result[0]).toMatchObject({
      faculty: [{ idExterno: 'doc-1', nome: 'DOCENTE UM' }],
      visibility: { hidden: true, publicEligible: true, publicDefaultVisible: false, publicVisible: false },
    });
  });
});
