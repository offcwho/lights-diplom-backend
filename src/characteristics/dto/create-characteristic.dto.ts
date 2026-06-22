import { IsEnum, IsString, MaxLength } from 'class-validator';
import { CharacteristicsType } from '../../generated/prisma/enums';

export class CreateCharacteristicDto {
  @IsString() @MaxLength(120)
  name: string;

  @IsEnum(CharacteristicsType)
  type: CharacteristicsType;
}
