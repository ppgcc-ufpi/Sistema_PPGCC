import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FacultyController } from './faculty.controller';
import { FacultyService } from './faculty.service';

@Module({
  imports: [AuthModule],
  controllers: [FacultyController],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}
