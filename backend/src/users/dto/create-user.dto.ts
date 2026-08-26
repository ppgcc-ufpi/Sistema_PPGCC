import { PerfilUsuario as UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(12) password!: string;
  @IsOptional() @IsString() name?: string;
  @IsEnum(UserRole) role!: UserRole;
  @ValidateIf((o: CreateUserDto) => o.role === UserRole.DOCENTE)
  @IsString() facultyExternalId?: string;
}
