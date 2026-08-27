import { Controller, Get, ParseEnumPipe, Query, UseGuards } from '@nestjs/common';
import { TipoEntidade as EntityType } from '@prisma/client';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { RecordsService } from './records.service';

@Controller('records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecordsController {
  constructor(private readonly records: RecordsService) {}

  @Get('faculty')
  @Roles(UserRole.DOCENTE)
  faculty(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type', new ParseEnumPipe(EntityType)) type: EntityType,
  ) {
    return this.records.forFaculty(user, type);
  }

  @Get('coordination')
  @Roles(UserRole.COORDENACAO)
  coordination(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type', new ParseEnumPipe(EntityType)) type: EntityType,
  ) {
    return this.records.forCoordination(user, type);
  }
}
