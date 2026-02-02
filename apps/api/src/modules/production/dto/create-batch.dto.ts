import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class BatchItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  plannedQuantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateBatchDto {
  @IsDateString()
  @IsNotEmpty()
  productionDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
