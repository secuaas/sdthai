import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePartnerSessionDto {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  deviceType: 'DESKTOP' | 'MOBILE';

  @IsString()
  @IsOptional()
  ipAddress?: string;
}
