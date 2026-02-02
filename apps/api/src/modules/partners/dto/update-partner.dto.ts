import {
  IsEnum,
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';
import { PartnerType } from '@sdthai/prisma';

export class UpdatePartnerDto {
  @IsEnum(PartnerType)
  @IsOptional()
  type?: PartnerType;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  vatNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  canton?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

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
