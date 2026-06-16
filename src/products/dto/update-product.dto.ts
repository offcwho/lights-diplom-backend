import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttributeDto {
    @IsString() name!: string;
    @IsString() value!: string;
}

export class UpdateProductDto {
    // ...
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttributeDto)
    attributes?: AttributeDto[];     // ← было: attributes: JSON

    @IsOptional() @IsString()
    categoryId?: string;

}