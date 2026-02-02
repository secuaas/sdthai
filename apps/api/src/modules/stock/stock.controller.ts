import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@sdthai/prisma';

@Controller('stock')
@UseGuards(RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.stockService.findAll();
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN)
  getSummary() {
    return this.stockService.getSummary();
  }

  @Get('alerts')
  @Roles(UserRole.SUPER_ADMIN)
  getAlerts() {
    return this.stockService.getAlerts();
  }

  @Post('adjustment')
  @Roles(UserRole.SUPER_ADMIN)
  adjustment(@Body() adjustmentDto: StockAdjustmentDto) {
    return this.stockService.adjustment(adjustmentDto);
  }

  @Post('reserve')
  @Roles(UserRole.SUPER_ADMIN)
  reserve(@Body() body: { orderId: string }) {
    return this.stockService.reserve(body.orderId);
  }

  @Post('release')
  @Roles(UserRole.SUPER_ADMIN)
  release(@Body() body: { orderId: string }) {
    return this.stockService.release(body.orderId);
  }
}
