import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ProductColor } from '../../generated/prisma/enums';
import { ProductSpecDto } from './product-spec.dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNumber() @Min(0)
  price: number;

  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsEnum(ProductColor)
  color?: ProductColor;

  @IsOptional() @IsArray() @IsString({ each: true })
  images?: string[];

  @IsOptional() @IsBoolean()
  isOnSale?: boolean;

  @IsOptional() @IsInt() @Min(0)
  discountPercent?: number;

  @IsOptional() @IsInt() @Min(0)
  popularity?: number;

  @IsOptional() @IsInt() @Min(0)
  stock?: number;

  @IsOptional() @ValidateNested() @Type(() => ProductSpecDto)
  spec?: ProductSpecDto;
}
