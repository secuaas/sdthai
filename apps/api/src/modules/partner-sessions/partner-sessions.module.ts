import { Module } from '@nestjs/common';
import { PartnerSessionsController } from './partner-sessions.controller';
import { PartnerSessionsService } from './partner-sessions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartnerSessionsController],
  providers: [PartnerSessionsService],
  exports: [PartnerSessionsService],
})
export class PartnerSessionsModule {}
