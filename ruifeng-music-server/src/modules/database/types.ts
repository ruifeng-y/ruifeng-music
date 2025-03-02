// src/modules/database/types.ts
import { ObjectLiteral, SelectQueryBuilder, FindTreeOptions, Repository, TreeRepository} from 'typeorm';
import { BaseRepository } from './base/repository';
import { BaseTreeRepository } from './base/tree.repository';
import { OrderType } from './constants';
import { SelectTrashMode } from '@/modules/database/constants';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DbFactoryOption, SeederConstructor } from './commands/types';

export type QueryHook<Entity> = (
    qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 分页原数据
 */
export interface PaginateMeta {
    /**
     * 当前页项目数量
     */
    itemCount: number;
    /**
     * 项目总数量
     */
    totalItems?: number;
    /**
     * 每页显示数量
     */
    perPage: number;
    /**
     * 总页数
     */
    totalPages?: number;
    /**
     * 当前页数
     */
    currentPage: number;
}

/**
 * 分页选项
 */
export interface PaginateOptions {
    /**
     * 当前页数
     */
    page?: number;
    /**
     * 每页显示数量
     */
    limit?: number;
}

/**
 * 分页返回数据
 */
export interface PaginateReturn<E extends ObjectLiteral> {
    meta: PaginateMeta;
    items: E[];
}

/**
  * 排序类型,{字段名称: 排序方法}
  * 如果多个值则传入数组即可
  * 排序方法不设置,默认DESC
*/
export type OrderQueryType =
| string
| { name: string; order: `${OrderType}` }
| Array<{ name: string; order: `${OrderType}` } | string>;

/**
 * 数据列表查询类型
 * addQuery用于添加额外的回调查询
 * orderBy: 用于覆盖默认的orderBy属性的自定义排序方式
 * withTrashed: 用于查询具有软删除功能的模型时把回收站中的数据也查询出来
 * onlyTrashed: 用于查询具有软删除功能的模型时只查询回收站中的数据（前提是withTrashed必须是true）
 */
export interface QueryParams<E extends ObjectLiteral> {
    addQuery?: QueryHook<E>;
    orderBy?: OrderQueryType;
    withTrashed?: boolean;
    onlyTrashed?: boolean;
}

/**
 * 服务类数据列表查询类型
 */
export type ServiceListQueryOption<E extends ObjectLiteral> =
    | ServiceListQueryOptionWithTrashed<E>
    | ServiceListQueryOptionNotWithTrashed<E>;

/**
 * 带有软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionWithTrashed<E extends ObjectLiteral> = Omit<
    FindTreeOptions & QueryParams<E>,
    'withTrashed'
> & {
    trashed?: `${SelectTrashMode}`;
} & Record<string, any>;

/**
 * 不带软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionNotWithTrashed<E extends ObjectLiteral> = Omit<
    ServiceListQueryOptionWithTrashed<E>,
    'trashed'
>;

/**
 * Repository类型
 */
export type RepositoryType<E extends ObjectLiteral> =
    | Repository<E>
    | TreeRepository<E>
    | BaseRepository<E>
    | BaseTreeRepository<E>;


/**
 * 自定义数据库配置
 */
export type DbConfig = {
    // common: Record<string, any>;
    // connections: Array<TypeOrmModuleOptions & { name?: string }>;

    common: Record<string, any> & DbAdditionalOption;
    connections: Array<TypeOrmModuleOptions & { name?: string } & DbAdditionalOption>;
};

/**
 * 最终数据库配置
 */
export type DbOptions = Record<string, any> & {
    common: Record<string, any>;
    connections: TypeormOption[];
};

/**
 * Typeorm连接配置
 */
export type TypeormOption = Omit<TypeOrmModuleOptions, 'name' | 'migrations'> & {
    name: string;
} & DbAdditionalOption;

/**
 * 额外数据库选项,用于CLI工具
 */
type DbAdditionalOption = {
    paths?: {
        /**
         * 迁移文件路径
         */
        migration?: string;
    };

    /**
     * 是否在启动应用后自动运行迁移
    */
    autoMigrate?: boolean;

    /**
     * 数据填充入口类
     * seedRunner类型，用于在配置中指定自定义的填充入口类
     */
    seedRunner?: SeederConstructor;
    /**
     * 数据填充类列表
     * seeders类型用于设置填充类列表
     */
    seeders?: SeederConstructor[];

    // 为数据连接配置添加一个factories属性用于定义数据工厂列表
    factories?: (() => DbFactoryOption<any, any>)[];
};

/**
 * 数据生产
    数据生产用来生产模拟数据
    FactoryOverride类型
    该类型用于定义Factory自定义参数覆盖
 */
export type FactoryOverride<Entity> = {
    [Property in keyof Entity]?: Entity[Property];
};