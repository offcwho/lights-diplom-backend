import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { DiscountType } from '../../generated/prisma/enums';

export class CreatePromoCodeDto {
  @IsString() @MaxLength(32)
  code: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber() @Min(0)
  discountValue: number;

  @IsOptional() @IsNumber() @Min(0)
  minOrderAmount?: number;

  @IsOptional() @IsInt() @Min(1)
  maxUses?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsDateString()
  expiresAt?: string;
}
