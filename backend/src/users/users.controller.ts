import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COORDENACAO)
export class UsersController {
  constructor(private readonly users: UsersService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.users.list(user); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) { return this.users.create(user, dto); }
  @Patch(':id') update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateUserDto) { return this.users.update(user, id, dto); }
}
