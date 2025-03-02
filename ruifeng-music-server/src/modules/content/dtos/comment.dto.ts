// src/modules/content/dtos/comment.dto.ts
import { Transform } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsUUID,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { toNumber } from 'lodash';
import { PickType } from '@nestjs/swagger';
import { DtoValidation } from '@/modules/core/decorators/dto-validation.decorator'; 
import { IsDataExist } from '@/modules/core/constraints/data.exist.constraint';
import { PostEntity, CommentEntity } from '@/modules/content/entities/';
import { PaginateDto } from '@/modules/restful/dtos';
import { UserEntity } from '@/modules/user/entities';

/**
 * 评论分页查询验证
 */
@DtoValidation({ type: 'query' })
// export class QueryCommentDto implements PaginateOptions {
export class QueryCommentDto extends PaginateDto {
    @IsDataExist(PostEntity, {
        message: '文章不存在',
    })
    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsOptional()
    post?: string;

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
     * 根据传入评论发布者的ID对评论进行过滤
    */
    @IsDataExist(UserEntity, {
        message: '所属的用户不存在',
    })
    @IsUUID(undefined, { message: '用户ID格式错误' })
    @IsOptional()
    author?: string;
}

/**
 * 评论树查询
 */
@DtoValidation({ type: 'query' })
export class QueryCommentTreeDto extends PickType(QueryCommentDto, ['post']) {}

/**
 * 评论添加验证
 */
@DtoValidation()
export class CreateCommentDto {
    @MaxLength(1000, { message: '评论内容不能超过$constraint1个字' })
    @IsNotEmpty({ message: '评论内容不能为空' })
    body: string;

    @IsUUID(undefined, { message: 'ID格式错误' })
    @IsDefined({ message: 'ID必须指定' })
    post: string;

    @IsDataExist(CommentEntity, {
        message: '父评论不存在',
    })
    @IsUUID(undefined, { always: true, message: 'ID格式错误' })
    @ValidateIf((value) => value.parent !== null && value.parent)
    @IsOptional({ always: true })
    @Transform(({ value }) => (value === 'null' ? null : value))
    parent?: string;
}