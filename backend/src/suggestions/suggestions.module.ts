import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({ imports: [AuthModule], controllers: [SuggestionsController], providers: [SuggestionsService] })
export class SuggestionsModule {}
