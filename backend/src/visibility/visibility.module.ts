import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VisibilityController } from './visibility.controller';
import { VisibilityService } from './visibility.service';
@Module({ imports: [AuthModule], controllers: [VisibilityController], providers: [VisibilityService] })
export class VisibilityModule {}
