import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, StockPurpose } from '@sdthai/prisma';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Create stock entry (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  async create(@Body() createDto: CreateStockEntryDto) {
    return this.stockService.create(createDto);
  }

  /**
   * Get all stock entries (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  async findAll(@Query('purpose') purpose?: string) {
    if (purpose && Object.values(StockPurpose).includes(purpose as StockPurpose)) {
      return this.stockService.findByPurpose(purpose as StockPurpose);
    }
    return this.stockService.findAll();
  }

  /**
   * Get stock summary (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('summary')
  async getSummary() {
    return this.stockService.getStockSummary();
  }

  /**
   * Get stock by product
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.stockService.findByProduct(productId);
  }

  /**
   * Get stock assigned to user (DEMO/STAFF)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('assigned/:userId')
  async findByAssignedUser(@Param('userId') userId: string) {
    return this.stockService.findByAssignedUser(userId);
  }

  /**
   * Get single stock entry
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  /**
   * Delete stock entry (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}
