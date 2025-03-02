import { PaginateOptions } from '@/modules/database/types';
// import { Transform } from 'class-transformer';
// import {
//     IsNumber,
//     IsOptional,
//     Min,
// } from 'class-validator';
// import { toNumber } from 'lodash';

export class QuerySingerDto implements PaginateOptions {

    // @Transform(({ value }) => toNumber(value))
    // @Min(1, { message: '当前页必须大于1' })
    // @IsNumber()
    // @IsOptional()

    /**
     * 当前页
     */
    // page = 1;


    // @Transform(({ value }) => toNumber(value))
    // @Min(1, { message: '每页显示数据必须大于1' })
    // @IsNumber()
    // @IsOptional()
    // /**
    //  * 每页显示数据
    //  */
    // limit = 10;

    /**
     * 歌手名称
     */
    name?: string;
    /**
     * 歌手性别
     */
    sex?: number;
    /**
     * 歌手地区
     */
    location?: string;

    /**
     * 每页显示数据
     */
    limit?: number;

    /**
     * 当前页
     */
    page?: number;
}