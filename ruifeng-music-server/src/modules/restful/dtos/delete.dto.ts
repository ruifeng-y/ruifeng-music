// src/modules/restful/dtos/delete.dto.ts
import { DtoValidation } from '@/modules/core/decorators';
import { IsDefined, IsUUID } from 'class-validator';

/**
 * 批量删除验证
 */
@DtoValidation()
export class DeleteDto {
    /**
     * 待删除数据的ID列表
     */
    @IsUUID(undefined, {
        each: true,
        message: 'ID格式错误',
    })
    @IsDefined({
        each: true,
        message: 'ID必须指定',
    })
    ids: string[];
}