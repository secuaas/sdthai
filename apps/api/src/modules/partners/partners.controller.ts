import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@sdthai/prisma';

@ApiTags('partners')
@Controller('partners')
@UseGuards(RolesGuard)
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new partner (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Partner created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or email already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.create(createPartnerDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all partners (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns list of all partners' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  findAll() {
    return this.partnersService.findAll();
  }

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public partners list (no auth required)' })
  @ApiResponse({ status: 200, description: 'Returns list of active partners for public display' })
  findPublic() {
    return this.partnersService.findPublic();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Returns partner details' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Super Admin only' })
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update partner (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  update(@Param('id') id: string, @Body() updatePartnerDto: UpdatePartnerDto) {
    return this.partnersService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete partner (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Partner UUID' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
