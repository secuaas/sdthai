import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@sdthai/prisma';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * Create a new return (driver or admin)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @Post()
  async create(@Body() createDto: CreateReturnDto, @Req() req: any) {
    return this.returnsService.create(createDto, req.user.userId);
  }

  /**
   * Get all returns (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  async findAll() {
    return this.returnsService.findAll();
  }

  /**
   * Get returns for a specific partner
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('partner/:partnerId')
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.returnsService.findByPartner(partnerId);
  }

  /**
   * Get a single return by ID
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER, UserRole.PARTNER)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  /**
   * Update return status (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReturnStatusDto,
  ) {
    return this.returnsService.updateStatus(id, updateDto);
  }

  /**
   * Add photo to return (driver or admin)
   * Body: { url: string }
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @Post(':id/photos')
  async addPhoto(@Param('id') id: string, @Body('url') url: string) {
    return this.returnsService.addPhoto(id, url);
  }

  /**
   * Get photos for a return
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER, UserRole.PARTNER)
  @Get(':id/photos')
  async getPhotos(@Param('id') id: string) {
    return this.returnsService.getPhotos(id);
  }

  /**
   * Delete a photo (admin only)
   */
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('photos/:photoId')
  async deletePhoto(@Param('photoId') photoId: string) {
    return this.returnsService.deletePhoto(photoId);
  }
}
