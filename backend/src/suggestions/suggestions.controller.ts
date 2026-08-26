import { Body, Controller, Get, Param, ParseEnumPipe, Post, Query, UseGuards } from '@nestjs/common';
import { StatusSugestao as SuggestionStatus } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthenticatedUser, UserRole } from '../auth/auth.types';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { DecideSuggestionDto } from './dto/decide-suggestion.dto';
import { SuggestionsService } from './suggestions.service';

@Controller('suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuggestionsController {
  constructor(private readonly suggestions: SuggestionsService) {}
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateSuggestionDto) { return this.suggestions.create(user, dto); }
  @Get('mine') mine(@CurrentUser() user: AuthenticatedUser) { return this.suggestions.mine(user); }
  @Get('coordination') @Roles(UserRole.COORDENACAO)
  list(@CurrentUser() user: AuthenticatedUser, @Query('status', new ParseEnumPipe(SuggestionStatus, { optional: true })) status?: SuggestionStatus) { return this.suggestions.listForCoordination(user, status); }
  @Post(':id/decision') @Roles(UserRole.COORDENACAO)
  decide(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: DecideSuggestionDto) { return this.suggestions.decide(user, id, dto); }
}
