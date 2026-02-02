import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class StockAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  stockEntryId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
