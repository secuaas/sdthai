import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsNumber()
  @IsOptional()
  routeOrder?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
