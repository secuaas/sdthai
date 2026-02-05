import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { StockPurpose } from '@sdthai/prisma';

export class CreateStockEntryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsEnum(StockPurpose)
  purpose: StockPurpose;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
