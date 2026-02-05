import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { PartnerType } from '@sdthai/prisma';

export class CreatePartnerDto {
  @IsEnum(PartnerType)
  @IsNotEmpty()
  type: PartnerType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsArray()
  @IsOptional()
  fixedDeliveryDays?: number[];

  @IsBoolean()
  @IsOptional()
  canOrderViaAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
