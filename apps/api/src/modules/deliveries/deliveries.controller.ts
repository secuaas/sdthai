import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@sdthai/prisma';

@Controller('deliveries')
@UseGuards(RolesGuard)
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  findAll() {
    return this.deliveriesService.findAll();
  }

  @Get('today')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  findToday() {
    return this.deliveriesService.findToday();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Patch(':id/assign')
  @Roles(UserRole.SUPER_ADMIN)
  assign(@Param('id') id: string, @Body() body: { driverId: string }) {
    return this.deliveriesService.assign(id, body.driverId);
  }

  @Post(':id/start')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  start(@Param('id') id: string) {
    return this.deliveriesService.start(id);
  }

  @Post(':id/complete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  complete(@Param('id') id: string, @Body() completeDeliveryDto: CompleteDeliveryDto) {
    return this.deliveriesService.complete(id, completeDeliveryDto);
  }

  @Post(':id/fail')
  @Roles(UserRole.SUPER_ADMIN, UserRole.DRIVER)
  fail(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.deliveriesService.fail(id, body.reason);
  }
}
