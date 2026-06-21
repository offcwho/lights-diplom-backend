import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsOptional() @IsString() @MaxLength(80)
  label?: string;

  @IsString() @MaxLength(120)
  city: string;

  @IsString() @MaxLength(255)
  street: string;

  @IsString() @MaxLength(20)
  house: string;

  @IsOptional() @IsString() @MaxLength(20)
  apartment?: string;

  @IsOptional() @IsString() @MaxLength(20)
  zipCode?: string;

  @IsOptional() @IsBoolean()
  isDefault?: boolean;
}
