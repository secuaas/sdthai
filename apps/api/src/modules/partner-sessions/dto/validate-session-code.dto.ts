import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ValidateSessionCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  sessionCode: string;
}
