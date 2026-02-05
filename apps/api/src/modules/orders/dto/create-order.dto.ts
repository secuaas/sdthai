import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '@sdthai/prisma';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsDateString()
  @IsNotEmpty()
  requestedDate: string;

  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @IsString()
  @IsOptional()
  urgentReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType;

  @IsISO8601()
  @IsOptional()
  onSiteDeliveryTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
