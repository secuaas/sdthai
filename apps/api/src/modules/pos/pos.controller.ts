import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@sdthai/prisma';

@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  /**
   * Create a new POS transaction (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('transactions')
  async create(@Body() createDto: CreateTransactionDto, @Req() req: any) {
    return this.posService.create(createDto, req.user.id);
  }

  /**
   * Get all transactions (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('transactions')
  async findAll() {
    return this.posService.findAll();
  }

  /**
   * Get transactions for a specific partner
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('transactions/partner/:partnerId')
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.posService.findByPartner(partnerId);
  }

  /**
   * Get a single transaction by ID
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('transactions/:id')
  async findOne(@Param('id') id: string) {
    return this.posService.findOne(id);
  }

  /**
   * Get statistics for a partner
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('stats/:partnerId')
  async getStats(
    @Param('partnerId') partnerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.posService.getStats(partnerId, start, end);
  }
}
