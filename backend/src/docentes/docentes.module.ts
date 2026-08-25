import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';

@Module({
  imports: [AuthModule],
  controllers: [DocentesController],
  providers: [DocentesService],
  exports: [DocentesService],
})
export class DocentesModule {}
