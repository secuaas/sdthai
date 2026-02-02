import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, BatchStatus } from '@sdthai/prisma';

@Controller('production')
@UseGuards(RolesGuard)
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('batches')
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.productionService.create(createBatchDto);
  }

  @Get('batches')
  @Roles(UserRole.SUPER_ADMIN)
  findAll(@Query('status') status?: BatchStatus) {
    return this.productionService.findAll(status);
  }

  @Get('batches/:id')
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.productionService.findOne(id);
  }

  @Get('planning')
  @Roles(UserRole.SUPER_ADMIN)
  getPlanning(@Query('date') date: string) {
    if (!date) {
      const today = new Date();
      date = today.toISOString().split('T')[0];
    }
    return this.productionService.getPlanning(date);
  }

  @Post('batches/:id/start')
  @Roles(UserRole.SUPER_ADMIN)
  start(@Param('id') id: string) {
    return this.productionService.start(id);
  }

  @Post('batches/:id/complete')
  @Roles(UserRole.SUPER_ADMIN)
  complete(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.productionService.complete(id, updateBatchDto);
  }

  @Post('batches/:id/cancel')
  @Roles(UserRole.SUPER_ADMIN)
  cancel(@Param('id') id: string) {
    return this.productionService.cancel(id);
  }
}
