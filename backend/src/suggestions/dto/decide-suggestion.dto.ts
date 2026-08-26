import { TipoDecisao as DecisionType } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class DecideSuggestionDto {
  @IsEnum(DecisionType) type!: DecisionType;
  @IsString() @MinLength(10) justification!: string;
}
