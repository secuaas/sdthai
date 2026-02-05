import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PartnerSessionsService } from './partner-sessions.service';
import { CreatePartnerSessionDto } from './dto/create-partner-session.dto';
import { ValidateSessionCodeDto } from './dto/validate-session-code.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@sdthai/prisma';

@ApiTags('partner-sessions')
@Controller('partner-sessions')
export class PartnerSessionsController {
  constructor(
    private readonly partnerSessionsService: PartnerSessionsService,
  ) {}

  @Public()
  @Post('request')
  @ApiOperation({
    summary: 'Request a new session code (Public)',
    description: 'Partners can request a temporary 6-character session code for authentication'
  })
  @ApiResponse({ status: 201, description: 'Session code created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid partner ID' })
  async requestSession(
    @Body() createDto: CreatePartnerSessionDto,
    @Req() req: any,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    return this.partnerSessionsService.create({
      ...createDto,
      ipAddress,
    });
  }

  @Public()
  @Post('validate')
  @ApiOperation({
    summary: 'Validate a session code (Public)',
    description: 'Validate a 6-character session code and get partner session details'
  })
  @ApiResponse({ status: 200, description: 'Session code validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired session code' })
  async validateCode(@Body() dto: ValidateSessionCodeDto) {
    return this.partnerSessionsService.validateCode(dto.sessionCode);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all session codes (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all partner sessions' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll() {
    return this.partnerSessionsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('partner/:partnerId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get sessions for a specific partner (Admin only)' })
  @ApiParam({ name: 'partnerId', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Returns partner sessions' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.partnerSessionsService.findByPartner(partnerId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/activate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate a session code (Admin only)' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Session activated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async activate(@Param('id') id: string) {
    return this.partnerSessionsService.activate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/deactivate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Deactivate a session code (Admin only)' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Session deactivated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deactivate(@Param('id') id: string) {
    return this.partnerSessionsService.deactivate(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a session code (Admin only)' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async remove(@Param('id') id: string) {
    return this.partnerSessionsService.remove(id);
  }
}
