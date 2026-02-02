import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CompleteDeliveryDto {
  @IsString()
  @IsNotEmpty()
  signedBy: string;

  @IsString()
  @IsOptional()
  signatureKey?: string;

  @IsArray()
  @IsOptional()
  photoKeys?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
