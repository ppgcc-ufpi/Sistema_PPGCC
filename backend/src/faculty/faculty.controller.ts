import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { FacultyService } from './faculty.service';

@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FacultyController {
  constructor(private readonly faculty: FacultyService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    if (!user.docenteId) {
      throw new NotFoundException('Este usuário não está vinculado a um docente.');
    }
    return this.faculty.getFullProfile(user.docenteId);
  }

  @Get()
  @Roles(UserRole.COORDENACAO)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.faculty.list(user.programaId);
  }

  @Get(':id')
  @Roles(UserRole.COORDENACAO)
  find(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.faculty.getFullProfileByExternalId(user.programaId, id);
  }
}
