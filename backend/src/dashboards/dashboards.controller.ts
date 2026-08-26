import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get('coordination')
  @Roles(UserRole.COORDENACAO)
  coordination(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboards.coordination(user.programaId);
  }

  @Get('faculty')
  @Roles(UserRole.DOCENTE)
  faculty(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboards.faculty(user.docenteId);
  }
}
