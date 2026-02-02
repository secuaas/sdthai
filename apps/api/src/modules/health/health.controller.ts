import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prismaService: PrismaService) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'SD Thai Food API',
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'SD Thai Food API',
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
