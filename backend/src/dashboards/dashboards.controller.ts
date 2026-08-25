import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PerfilUsuario, UsuarioAutenticado } from '../auth/auth.types';
import { DashboardsService } from './dashboards.service';

@Controller('dashboards')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get('coordenacao')
  @Roles(PerfilUsuario.COORDENACAO)
  coordenacao() {
    return this.dashboards.coordenacao();
  }

  @Get('docente')
  @Roles(PerfilUsuario.DOCENTE)
  docente(@CurrentUser() usuario: UsuarioAutenticado) {
    return this.dashboards.docente(usuario.docenteId);
  }
}
