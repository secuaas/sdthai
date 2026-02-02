import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
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
  nameDe?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @IsString()
  @IsOptional()
  descriptionDe?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsNumber()
  @IsOptional()
  priceB2b?: number;

  @IsNumber()
  @IsOptional()
  priceB2c?: number;

  @IsNumber()
  @IsOptional()
  shelfLifeDays?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsArray()
  @IsOptional()
  allergens?: string[];

  @IsBoolean()
  @IsOptional()
  isVegetarian?: boolean;

  @IsBoolean()
  @IsOptional()
  isVegan?: boolean;

  @IsBoolean()
  @IsOptional()
  isGlutenFree?: boolean;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  spicyLevel?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @IsOptional()
  bexioArticleId?: number;

  @IsNumber()
  @IsOptional()
  minStockAlert?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
