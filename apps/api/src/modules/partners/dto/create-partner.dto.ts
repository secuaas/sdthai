import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsDecimal,
} from 'class-validator';
import { PartnerType } from '@sdthai/prisma';

export class CreatePartnerDto {
  @IsEnum(PartnerType)
  @IsNotEmpty()
  type: PartnerType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  canton?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  deliveryDays?: string[];

  @IsString()
  @IsOptional()
  orderDeadlineTime?: string;

  @IsNumber()
  @IsOptional()
  orderDeadlineDays?: number;

  @IsString()
  @IsOptional()
  billingPeriod?: string;

  @IsNumber()
  @IsOptional()
  billingDay?: number;

  @IsNumber()
  @IsOptional()
  bexioContactId?: number;

  @IsString()
  @IsOptional()
  googlePlaceId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
