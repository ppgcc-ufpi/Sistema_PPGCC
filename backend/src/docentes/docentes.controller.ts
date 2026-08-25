import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { PerfilUsuario, UsuarioAutenticado } from '../auth/auth.types';
import { DocentesService } from './docentes.service';

@Controller('docentes')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class DocentesController {
  constructor(private readonly docentes: DocentesService) {}

  @Get('me')
  buscarMeuPerfil(@CurrentUser() usuario: UsuarioAutenticado) {
    if (!usuario.docenteId) {
      throw new NotFoundException('Este usuário não está vinculado a um docente.');
    }
    return this.docentes.buscarDadosCompletos(usuario.docenteId);
  }

  @Get()
  @Roles(PerfilUsuario.COORDENACAO)
  listar() {
    return this.docentes.listar();
  }

  @Get(':id')
  @Roles(PerfilUsuario.COORDENACAO)
  buscar(@Param('id') id: string) {
    return this.docentes.buscarDadosCompletos(id);
  }
}
