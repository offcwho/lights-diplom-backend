import { IsEnum } from 'class-validator';
import { SupportStatus } from '../../generated/prisma/enums';

export class UpdateTicketDto {
  @IsEnum(SupportStatus)
  status: SupportStatus;
}
