import {
  IsArray,
  IsOptional,
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateBatchItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  actualQuantity: number;
}

export class UpdateBatchDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateBatchItemDto)
  items?: UpdateBatchItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
