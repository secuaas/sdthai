import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReturnStatus } from '@sdthai/prisma';

export class UpdateReturnStatusDto {
  @IsEnum(ReturnStatus)
  @IsNotEmpty()
  status: ReturnStatus;
}
