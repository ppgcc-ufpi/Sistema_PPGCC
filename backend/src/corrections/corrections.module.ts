import { Global, Module } from '@nestjs/common';
import { CorrectionsService } from './corrections.service';

@Global()
@Module({ providers: [CorrectionsService], exports: [CorrectionsService] })
export class CorrectionsModule {}
