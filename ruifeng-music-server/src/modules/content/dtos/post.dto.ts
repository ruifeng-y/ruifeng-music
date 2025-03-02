// src/modules/content/dtos/post.dto.ts

import { OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { isNil, toNumber } from 'lodash';
import { toBoolean } from '@/modules/core/helpers';
import { PaginateWithTrashedDto } from '@/modules/restful/dtos';
import { PostOrderType } from '../constants';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator'; 
import { IsDataExist } from '@/modules/core/constraints/data.exist.constraint';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@/modules/user/entities';
import { CategoryEntity, TagEntity } from '../entities';

/**
 * 文章分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryPostDto extends PaginateWithTrashedDto  {
    /**
     * 全文搜索
     */
    @MaxLength(100, {
        always: true,
        message: '搜索字符串长度不得超过$constraint1',
    })
    @IsOptional({ always: true })
    search?: string;

    /**
     * 是否查询已发布(全部文章:不填、只查询已发布的:true、只查询未发布的:false)
     */
    @Transform(({ value }) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    /**
     * 查询结果排序,不填则综合排序
     */
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;

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

    /**
     * 根据分类ID查询此分类及其后代分类下的文章
     */
    @IsDataExist(CategoryEntity, {
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsOptional()
    category?: string;

    /**
     * 根据标签ID查询
     */
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsOptional()
    tag?: string;

    // /**
    //  * 此属性的类型就是SelectTrashMode，用于在查询数据列表时设置待查询数据的状态
    //  */
    // @IsEnum(SelectTrashMode)
    // @IsOptional()
    // trashed?: SelectTrashMode;

    /**
     * 根据文章作者ID查询
     */
    @IsDataExist(UserEntity, {
        message: '指定的用户不存在',
    })
    @IsUUID(undefined, { message: '用户ID格式错误' })
    @IsOptional()
    author?: string;

}

/**
 * 文章创建验证
 */
@DtoValidation({ groups: ['create'] })
export class CreatePostDto {
    /**
     * 文章标题
     */
    @ApiProperty({ description: '文章标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '文章标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title: string;

    /**
     * 文章内容
     */
    @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body: string;

    /**
     * 是否发布(发布时间)
     */
    // @IsDateString({ strict: true }, { always: true })
    @IsOptional({ always: true })
    @ValidateIf((value) => !isNil(value.publishedAt))
    @Transform(({ value }) => (value === 'null' ? null : value))
    publishedAt?: Date;

    /**
     * SEO关键字
     */
    @MaxLength(20, {
        each: true,
        always: true,
        message: '每个关键字长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    keywords?: string[];

    /**
     * 自定义排序
     */
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    customOrder?: number = 0;

    /**
     * 所属分类ID
     */
    @IsDataExist(CategoryEntity, {
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: 'ID格式不正确',
    })
    @IsOptional({ groups: ['update'] })
    category: string;

    /**
     * 关联标签ID
     */
    @IsDataExist(TagEntity, {
        each: true,
        always: true,
        message: '标签不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: 'ID格式不正确',
    })
    @IsNotEmpty({ groups: ['create'], message: '分类必须设置' })
    @IsOptional({ always: true })
    tags?: string[];

    /**
     * 文章作者ID:可用于在管理员发布文章时分配给其它用户,如果不设置,则作者为当前管理员
     */
    @IsDataExist(UserEntity, {
        always: true,
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    @IsOptional({ always: true })
    author?: string;

    @ApiPropertyOptional({
        description: '文章描述',
        maxLength: 500,
    })
    @MaxLength(500, {
        always: true,
        message: '文章描述长度最大为$constraint1',
    })
    @IsOptional({ always: true })
    summary?: string;

    @Transform(({ value }) => toBoolean(value))
    @IsBoolean({ always: true })
    @ValidateIf((value) => !isNil(value.publish))
    @IsOptional({ always: true })
    publish?: boolean;
  
    // @MaxLength(20, {
    //     each: true,
    //     always: true,
    //     message: '每个关键字长度最大为$constraint1',
    // })
    // @IsOptional({ always: true })
    // keywords?: string[];

    // @Transform(({ value }) => toNumber(value))
    // @Min(0, { always: true, message: '排序值必须大于0' })
    // @IsNumber(undefined, { always: true })
    // @IsOptional({ always: true })
    // customOrder?: number = 0;

//     @IsDataExist(CategoryEntity, {
//         always: true,
//         message: '分类不存在',
//     })
//    @IsUUID(undefined, {
//     always: true,
//     message: 'ID格式错误',
//     })
//     @IsOptional({ always: true })
//     category?: string;

    // /**
    //  * 根据标签ID查询
    //  */
    // @IsDataExist(CategoryEntity, {
    //     always: true,
    //     message: '分类不存在',
    // })
    // @IsUUID(undefined, {
    //     always: true,
    //     each: true,
    //     message: 'ID格式错误',
    // })
    // @IsOptional({ always: true })
    // tags?: string[];

}

/**
 * 文章更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
    // @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
    // @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
    // id: string;

     /**
     * 待更新ID
     */
     @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
     @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
     id: string;

}

/**
 * 客户端查询文章列表验证
 */
@DtoValidation({ type: 'query' })
export class FrontendQueryPostDto extends OmitType(QueryPostDto, ['isPublished', 'trashed']) {}

/**
 * 客户端创建文章验证
 */
@DtoValidation({ groups: ['create'] })
export class FrontendCreatePostDto extends OmitType(CreatePostDto, ['author', 'customOrder']) {
    /**
     * 用户侧排序:文章在用户的文章管理而非后台中,列表的排序规则
     */
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    userOrder?: number = 0;
}

/**
 * 用户文章更新验证
 */
@DtoValidation({ groups: ['update'] })
export class OnwerUpdatePostDto extends OmitType(UpdatePostDto, ['author', 'customOrder']) {
    /**
     * 用户侧排序:文章在用户的文章管理而非后台中,列表的排序规则
     */
    @Transform(({ value }) => toNumber(value))
    @Min(0, { always: true, message: '排序值必须大于0' })
    @IsNumber(undefined, { always: true })
    @IsOptional({ always: true })
    userOrder?: number = 0;
}

/**
 * 用户查询自己的文章列表验证
 */
@DtoValidation({ type: 'query' })
export class OwnerQueryPostDto extends OmitType(QueryPostDto, ['author']) {}
