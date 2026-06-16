import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsJSON, IsNumber, IsOptional, IsString, Min,
  ValidateNested,
} from 'class-validator';

class AttributeDto {
  @IsString() name!: string;
  @IsString() value!: string;
}


export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional() @IsString()
  description?: string;

  @IsNumber() @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeDto)
  attributes?: AttributeDto[];

  @IsOptional() @IsString()
  categoryId?: string;

  @IsOptional() @IsString()
  material?: string;

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
}
