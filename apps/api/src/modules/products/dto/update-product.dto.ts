import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  nameFr?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  priceB2b?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
