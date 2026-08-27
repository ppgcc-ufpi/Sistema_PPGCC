import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { CorrectionsModule } from '../corrections/corrections.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RecordsModule } from './records.module';

describe('RecordsModule', () => {
  it('resolve as dependências dos guards de autenticação', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-secret-with-safe-length' })],
        }),
        PrismaModule,
        CorrectionsModule,
        RecordsModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    await module.close();
  });
});
