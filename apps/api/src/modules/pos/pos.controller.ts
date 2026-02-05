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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@sdthai/prisma';

@ApiTags('pos')
@ApiBearerAuth('JWT-auth')
@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post('transactions')
  @ApiOperation({
    summary: 'Create a POS transaction (Admin only)',
    description: 'Create a point of sale transaction for DEPOT_AUTOMATE partners with automatic price calculation'
  })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Partner or product not found' })
  async create(@Body() createDto: CreateTransactionDto, @Req() req: any) {
    return this.posService.create(createDto, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('transactions')
  @ApiOperation({
    summary: 'Get all POS transactions (Admin only)',
    description: 'Retrieve all point of sale transactions across all partners'
  })
  @ApiResponse({ status: 200, description: 'Returns list of all transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll() {
    return this.posService.findAll();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('transactions/partner/:partnerId')
  @ApiOperation({
    summary: 'Get transactions for a specific partner',
    description: 'Retrieve all POS transactions for a given partner (Admin or Partner owner)'
  })
  @ApiParam({ name: 'partnerId', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Returns partner transactions' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.posService.findByPartner(partnerId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('transactions/:id')
  @ApiOperation({
    summary: 'Get a single transaction by ID',
    description: 'Retrieve details of a specific POS transaction'
  })
  @ApiParam({ name: 'id', description: 'Transaction UUID' })
  @ApiResponse({ status: 200, description: 'Returns transaction details' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string) {
    return this.posService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('stats/:partnerId')
  @ApiOperation({
    summary: 'Get POS statistics for a partner',
    description: 'Retrieve sales statistics (total amount, transaction count, etc.) for a partner with optional date range'
  })
  @ApiParam({ name: 'partnerId', description: 'Partner UUID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO 8601)', example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO 8601)', example: '2026-12-31' })
  @ApiResponse({ status: 200, description: 'Returns partner statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
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
