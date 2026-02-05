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
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryType } from '@sdthai/prisma';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '9085ae89-c568-492e-be20-4f9f9cd94388',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to order',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Partner UUID',
    example: '8beef599-c85d-4d75-b093-1b0cc4773f38',
  })
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @ApiProperty({
    description: 'Requested delivery date (YYYY-MM-DD)',
    example: '2026-02-10',
  })
  @IsDateString()
  @IsNotEmpty()
  requestedDate: string;

  @ApiProperty({
    description: 'Mark as urgent order (bypasses deadline validation)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isUrgent?: boolean;

  @ApiProperty({
    description: 'Reason for urgent order',
    example: 'Customer special request',
    required: false,
  })
  @IsString()
  @IsOptional()
  urgentReason?: string;

  @ApiProperty({
    description: 'Additional notes for the order',
    example: 'Deliver in the morning if possible',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Delivery type: STANDARD (regular delivery) or ON_SITE (delivery at specific time/location)',
    enum: DeliveryType,
    example: DeliveryType.STANDARD,
    required: false,
  })
  @IsEnum(DeliveryType)
  @IsOptional()
  deliveryType?: DeliveryType;

  @ApiProperty({
    description: 'Specific delivery time for ON_SITE orders (ISO 8601 format)',
    example: '2026-02-10T14:30:00Z',
    required: false,
  })
  @IsISO8601()
  @IsOptional()
  onSiteDeliveryTime?: string;

  @ApiProperty({
    description: 'List of products to order',
    type: [CreateOrderItemDto],
    example: [
      { productId: '9085ae89-c568-492e-be20-4f9f9cd94388', quantity: 5 },
      { productId: '20b29e8d-0f3e-4a5c-abd4-0fa67da8622d', quantity: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
