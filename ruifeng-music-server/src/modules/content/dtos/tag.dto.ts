//src/modules/content/dtos/tag.dto.ts
import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { toNumber } from 'lodash';
import { PaginateOptions } from '@/modules/database/types';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator'; 
import { IsUnique } from '@/modules/core/constraints/unique.constraint';
import { TagEntity } from '@/modules/content/entities/';
import { IsUniqueExist } from '@/modules/database/constraints/unique.exist.constraint';
/**
 * 标签分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryTagDto implements PaginateOptions {
    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '当前页必须大于1' })
    @IsNumber()
    @IsOptional()
    page = 1;

    @Transform(({ value }) => toNumber(value))
    @Min(1, { message: '每页显示数据必须大于1' })
    @IsNumber()
    @IsOptional()
    limit = 10;
}

/**
 * 标签创建验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateTagDto {
    @IsUnique(TagEntity, {
        groups: ['create'],
        message: '标签名称重复',
    })
    @IsUniqueExist(TagEntity, {
        groups: ['update'],
        message: '标签名称重复',
    })
    @MaxLength(255, {
        always: true,
        message: '标签名称长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '标签名称必须填写' })
    @IsOptional({ groups: ['update'] })
    name: string;
  
    @MaxLength(500, {
        always: true,
        message: '标签描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    description?: string;
}

/**
 * 标签更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateTagDto extends PartialType(CreateTagDto) {
    @IsUUID(undefined, { groups: ['update'], message: 'ID格式错误' })
    @IsDefined({ groups: ['update'], message: 'ID必须指定' })
    id: string;
}