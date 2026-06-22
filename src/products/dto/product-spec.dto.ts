import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProductSpecDto {
  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsNumber() @Min(0)
  weightKg?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  shapes?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  styles?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  rooms?: string[];

  @IsOptional() @IsString()
  lampType?: string;

  @IsOptional() @IsNumber() @Min(0)
  maxAreaM2?: number;

  @IsOptional() @IsString()
  mountingType?: string;

  @IsOptional() @IsString()
  packageSize?: string;

  @IsOptional() @IsString()
  frameMaterial?: string;

  @IsOptional() @IsString()
  frameColor?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  shadeMaterials?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  shadeColors?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  colorTemps?: string[];

  @IsOptional() @IsInt() @Min(0)
  powerW?: number;

  @IsOptional() @IsInt() @Min(0)
  lumens?: number;

  @IsOptional() @IsInt() @Min(1)
  lampCount?: number;
}
