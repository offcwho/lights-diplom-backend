import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum ProductSort {
  POPULAR = 'popular',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
}

const toArray = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value;

export class QueryProductsDto {
  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  onSale?: boolean;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsEnum(ProductSort)
  sort?: ProductSort = ProductSort.POPULAR;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 12;

  // Spec filters
  @IsOptional() @Transform(toArray) @IsArray() @IsString({ each: true })
  styles?: string[];

  @IsOptional() @Transform(toArray) @IsArray() @IsString({ each: true })
  rooms?: string[];

  @IsOptional() @Transform(toArray) @IsArray() @IsString({ each: true })
  shapes?: string[];

  @IsOptional() @Transform(toArray) @IsArray() @IsString({ each: true })
  colorTemps?: string[];

  @IsOptional() @IsString()
  lampType?: string;

  @IsOptional() @IsString()
  mountingType?: string;

  @IsOptional() @IsString()
  frameColor?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  minPowerW?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  maxPowerW?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  minAreaM2?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  maxAreaM2?: number;
}
