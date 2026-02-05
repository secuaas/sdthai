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
import { PartnerSessionsService } from './partner-sessions.service';
import { CreatePartnerSessionDto } from './dto/create-partner-session.dto';
import { ValidateSessionCodeDto } from './dto/validate-session-code.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@sdthai/prisma';

@Controller('partner-sessions')
export class PartnerSessionsController {
  constructor(
    private readonly partnerSessionsService: PartnerSessionsService,
  ) {}

  /**
   * Request a new session code
   * Public endpoint - partners can request sessions
   */
  @Public()
  @Post('request')
  async requestSession(
    @Body() createDto: CreatePartnerSessionDto,
    @Req() req: any,
  ) {
    // Get IP address from request
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    return this.partnerSessionsService.create({
      ...createDto,
      ipAddress,
    });
  }

  /**
   * Validate a session code
   * Public endpoint - partners use this to authenticate
   */
  @Public()
  @Post('validate')
  async validateCode(@Body() dto: ValidateSessionCodeDto) {
    return this.partnerSessionsService.validateCode(dto.sessionCode);
  }

  /**
   * Get all sessions (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  async findAll() {
    return this.partnerSessionsService.findAll();
  }

  /**
   * Get sessions for a specific partner (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('partner/:partnerId')
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.partnerSessionsService.findByPartner(partnerId);
  }

  /**
   * Activate a session (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    return this.partnerSessionsService.activate(id);
  }

  /**
   * Deactivate a session (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.partnerSessionsService.deactivate(id);
  }

  /**
   * Delete a session (admin only)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.partnerSessionsService.remove(id);
  }
}
