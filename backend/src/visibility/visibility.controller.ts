import { Body, Controller, Param, ParseEnumPipe, Patch, UseGuards } from '@nestjs/common';
import { TipoEntidade as EntityType } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisibilityController {
  constructor(private readonly visibility: VisibilityService) {}
  @Patch('coordination/:type/:id') @Roles(UserRole.COORDENACAO)
  coordination(@CurrentUser() user: AuthenticatedUser, @Param('type', new ParseEnumPipe(EntityType)) type: EntityType, @Param('id') id: string, @Body() dto: UpdateVisibilityDto) { return this.visibility.coordination(user, type, id, dto.hidden); }
  @Patch('faculty/:type/:id') @Roles(UserRole.DOCENTE)
  faculty(@CurrentUser() user: AuthenticatedUser, @Param('type', new ParseEnumPipe(EntityType)) type: EntityType, @Param('id') id: string, @Body() dto: UpdateVisibilityDto) { return this.visibility.faculty(user, type, id, dto.hidden); }
}
