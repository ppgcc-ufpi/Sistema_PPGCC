import { TipoEntidade as EntityType } from '@prisma/client';
import { IsEnum, IsObject, IsString, MinLength } from 'class-validator';

export class CreateSuggestionDto {
  @IsEnum(EntityType) entityType!: EntityType;
  @IsString() @MinLength(1) externalRecordId!: string;
  @IsObject() changes!: Record<string, unknown>;
  @IsString() @MinLength(10) justification!: string;
}
