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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@sdthai/prisma';

@ApiTags('returns')
@ApiBearerAuth('JWT-auth')
@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @Post()
  @ApiOperation({
    summary: 'Create a product return (Driver or Admin)',
    description: 'Create a return record for damaged, expired, incorrect, or excess products with optional photos'
  })
  @ApiResponse({ status: 201, description: 'Return created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Driver or Admin only' })
  @ApiResponse({ status: 404, description: 'Partner or product not found' })
  async create(@Body() createDto: CreateReturnDto, @Req() req: any) {
    return this.returnsService.create(createDto, req.user.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all returns (Admin only)',
    description: 'Retrieve all product returns across all partners'
  })
  @ApiResponse({ status: 200, description: 'Returns list of all returns' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async findAll() {
    return this.returnsService.findAll();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PARTNER)
  @Get('partner/:partnerId')
  @ApiOperation({
    summary: 'Get returns for a specific partner',
    description: 'Retrieve all returns for a given partner (Admin or Partner owner)'
  })
  @ApiParam({ name: 'partnerId', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Returns partner returns list' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async findByPartner(@Param('partnerId') partnerId: string) {
    return this.returnsService.findByPartner(partnerId);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER, UserRole.PARTNER)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a single return by ID',
    description: 'Retrieve details of a specific product return including photos'
  })
  @ApiParam({ name: 'id', description: 'Return UUID' })
  @ApiResponse({ status: 200, description: 'Returns return details' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Return not found' })
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put(':id/status')
  @ApiOperation({
    summary: 'Update return status (Admin only)',
    description: 'Approve or reject a product return (PENDING → APPROVED/REJECTED)'
  })
  @ApiParam({ name: 'id', description: 'Return UUID' })
  @ApiResponse({ status: 200, description: 'Return status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Return not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReturnStatusDto,
  ) {
    return this.returnsService.updateStatus(id, updateDto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER)
  @Post(':id/photos')
  @ApiOperation({
    summary: 'Add photo to return (Driver or Admin)',
    description: 'Add a photo URL to a product return (max 5 photos per return)'
  })
  @ApiParam({ name: 'id', description: 'Return UUID' })
  @ApiBody({ schema: { properties: { url: { type: 'string', example: 'https://example.com/photo.jpg' } } } })
  @ApiResponse({ status: 201, description: 'Photo added successfully' })
  @ApiResponse({ status: 400, description: 'Maximum 5 photos allowed' })
  @ApiResponse({ status: 403, description: 'Forbidden - Driver or Admin only' })
  @ApiResponse({ status: 404, description: 'Return not found' })
  async addPhoto(@Param('id') id: string, @Body('url') url: string) {
    return this.returnsService.addPhoto(id, url);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DRIVER, UserRole.PARTNER)
  @Get(':id/photos')
  @ApiOperation({
    summary: 'Get photos for a return',
    description: 'Retrieve all photo URLs associated with a product return'
  })
  @ApiParam({ name: 'id', description: 'Return UUID' })
  @ApiResponse({ status: 200, description: 'Returns list of photo URLs' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Return not found' })
  async getPhotos(@Param('id') id: string) {
    return this.returnsService.getPhotos(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('photos/:photoId')
  @ApiOperation({
    summary: 'Delete a photo (Admin only)',
    description: 'Remove a photo from a product return'
  })
  @ApiParam({ name: 'photoId', description: 'Photo UUID' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  async deletePhoto(@Param('photoId') photoId: string) {
    return this.returnsService.deletePhoto(photoId);
  }
}
