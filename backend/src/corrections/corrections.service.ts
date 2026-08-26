import { Injectable } from '@nestjs/common';
import { TipoEntidade } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyChanges } from './effective-data';

type SourceRecord = { idExterno: string; dadosOriginais: unknown };

@Injectable()
export class CorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async materialize(programaId: string, tipo: TipoEntidade, records: SourceRecord[]) {
    if (!records.length) return [];
    const corrections = await this.prisma.correcaoAprovada.findMany({
      where: {
        programaId, tipoEntidade: tipo, ativa: true,
        registroIdExterno: { in: records.map((item) => item.idExterno) },
      },
      orderBy: { aprovadaEm: 'asc' },
    });
    const byRecord = new Map<string, unknown[]>();
    for (const correction of corrections) {
      const changes = byRecord.get(correction.registroIdExterno) ?? [];
      changes.push(correction.alteracoes);
      byRecord.set(correction.registroIdExterno, changes);
    }
    return records.map((record) =>
      (byRecord.get(record.idExterno) ?? []).reduce(
        (data, changes) => applyChanges(data, changes),
        applyChanges(record.dadosOriginais, {}),
      ),
    );
  }
}
