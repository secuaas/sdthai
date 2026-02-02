import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class UpdateCategoryDto {
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
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
