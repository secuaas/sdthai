import {
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@sdthai/prisma';
import { CreateOrderItemDto } from './create-order.dto';

export class UpdateOrderDto {
  @IsDateString()
  @IsOptional()
  requestedDate?: string;

  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @IsString()
  @IsOptional()
  urgentReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @IsOptional()
  urgentApproved?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsOptional()
  items?: CreateOrderItemDto[];
}
