// src/modules/database/helpers.ts
import { 
    ObjectLiteral, 
    SelectQueryBuilder, 
    Repository, 
    ObjectType, 
    DataSource, 
    EntityManager, 
    DataSourceOptions, 
    EntityTarget 
} from 'typeorm';
import { PaginateOptions,PaginateReturn } from '../database/types';
import { isNil } from 'lodash';
import { CUSTOM_REPOSITORY_METADATA } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Configure } from '../config/configure';
import {
    DbConfig,
    DbOptions,
    OrderQueryType,
    TypeormOption,
} from './types';
import { Type } from '@nestjs/common';
import * as fakerjs from '@faker-js/faker';
import {
    DbFactoryBuilder,
    DefineFactory,
    Seeder,
    SeederConstructor,
    SeederOptions,
    FactoryOptions
} from './commands/types';
import { Ora } from 'ora';
import { AppConfig } from '../core/types';
import { DataFactory } from './resolver';


/**
 * 分页函数
 * @param qb queryBuilder实例
 * @param options 分页选项
 */
export const paginate = async <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    options: PaginateOptions,
): Promise<PaginateReturn<E>> => {
    const limit = isNil(options.limit) || options.limit < 1 ? 1 : options.limit;
    const page = isNil(options.page) || options.page < 1 ? 1 : options.page;
    const start = page >= 1 ? page - 1 : 0;
    const totalItems = await qb.getCount();
    qb.take(limit).skip(start * limit);
    const items = await qb.getMany();
    const totalPages =
        totalItems % limit === 0
            ? Math.floor(totalItems / limit)
            : Math.floor(totalItems / limit) + 1;
    const remainder = totalItems % limit !== 0 ? totalItems % limit : limit;
    const itemCount = page < totalPages ? limit : remainder;
    return {
        items,
        meta: {
            totalItems,
            itemCount,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
    };
};

/**
 * 数据手动分页函数
 * @param options 分页选项
 * @param data 数据列表
 */
export function treePaginate<E extends ObjectLiteral>(
    options: PaginateOptions,
    data: E[],
): PaginateReturn<E> {
    const { page, limit } = options;
    let items: E[] = [];
    const totalItems = data.length;
    const totalRst = totalItems / limit;
    const totalPages =
        totalRst > Math.floor(totalRst) ? Math.floor(totalRst) + 1 : Math.floor(totalRst);
    let itemCount = 0;
    if (page <= totalPages) {
        itemCount = page === totalPages ? totalItems - (totalPages - 1) * limit : limit;
        const start = (page - 1) * limit;
        items = data.slice(start, start + itemCount);
    }
    return {
        meta: {
            itemCount,
            totalItems,
            perPage: limit,
            totalPages,
            currentPage: page,
        },
        items,
    };
}

/**
 * 为查询添加排序,默认排序规则为DESC
 * @param qb 原查询
 * @param alias 别名
 * @param orderBy 查询排序
 */
export const getOrderByQuery = <E extends ObjectLiteral>(
    qb: SelectQueryBuilder<E>,
    alias: string,
    orderBy?: OrderQueryType,
) => {
    if (isNil(orderBy)) return qb;
    if (typeof orderBy === 'string') return qb.orderBy(`${alias}.${orderBy}`, 'DESC');
    if (Array.isArray(orderBy)) {
        for (const item of orderBy) {
            typeof item === 'string'
                ? qb.addOrderBy(`${alias}.${item}`, 'DESC')
                : qb.addOrderBy(`${alias}.${item.name}`, item.order);
        }
        return qb;
    }
    return qb.orderBy(`${alias}.${(orderBy as any).name}`, (orderBy as any).order);
};


/**
 * 获取自定义Repository的实例
 * @param dataSource 数据连接池
 * @param Repo repository类
 */
export const getCustomRepository = <T extends Repository<E>, E extends ObjectLiteral>(
    dataSource: DataSource,
    Repo: ClassType<T>,
): T => {
    if (isNil(Repo)) return null;
    const entity = Reflect.getMetadata(CUSTOM_REPOSITORY_METADATA, Repo);
    if (!entity) return null;
    const base = dataSource.getRepository<ObjectType<any>>(entity);
    return new Repo(base.target, base.manager, base.queryRunner) as T;
};

/**
 * 在模块上注册entity
 * 函数会根据传入的dataSource来判断把模型追加到哪个连接池，并使用TypeOrmModule.forFeature为Nestjs中的TypeormModule自动注册这些模型
 * @param configure 配置类实例
 * @param entities entity类列表
 * @param dataSource 数据连接名称,默认为default
 */
export const addEntities = async (
    configure: Configure,
    entities: EntityClassOrSchema[] = [],
    dataSource = 'default',
) => {
    const database = await configure.get<DbOptions>('database');
    if (isNil(database)) throw new Error(`Typeorm have not any config!`);
    const dbConfig = database.connections.find(({ name }) => name === dataSource);
    // eslint-disable-next-line prettier/prettier, prefer-template
    if (isNil(dbConfig)) throw new Error('Database connection named' + dataSource + 'not exists!');
    const oldEntities = (dbConfig.entities ?? []) as ObjectLiteral[];
    /**
     * 更新数据库配置,添加上新的模型
     */
    configure.set(
        'database.connections',
        database.connections.map((connection) =>
            connection.name === dataSource
                ? {
                      ...connection,
                      entities: [...entities, ...oldEntities],
                  }
                : connection,
        ),
    );
    return TypeOrmModule.forFeature(entities, dataSource);
};

/**
 * 在模块上注册订阅者
 * 函数会根据传入的dataSource来判断把订阅者追加到哪个连接池
 * @param configure 配置类实例
 * @param subscribers 订阅者列表
 * @param dataSource 数据库连接名称
 */
export const addSubscribers = async (
    configure: Configure,
    subscribers: Type<any>[] = [],
    dataSource = 'default',
) => {
    const database = await configure.get<DbConfig>('database');
    if (isNil(database)) throw new Error(`Typeorm have not any config!`);
    const dbConfig = database.connections.find(({ name }) => name === dataSource);
    // eslint-disable-next-line prettier/prettier, prefer-template
    if (isNil(dbConfig)) throw new Error('Database connection named' + dataSource + 'not exists!');

    const oldSubscribers = (dbConfig.subscribers ?? []) as any[];

    /**
     * 更新数据库配置,添加上新的订阅者
     */
    configure.set(
        'database.connections',
        database.connections.map((connection) =>
            connection.name === dataSource
                ? {
                      ...connection,
                      subscribers: [...oldSubscribers, ...subscribers],
                  }
                : connection,
        ),
    );
    return subscribers;
};

/**
 * 忽略外键
 * 在mysql下，运行指定了清空数据表的填充类时需要忽略外键
 * @param em EntityManager实例
 * @param type 数据库类型
 * @param disabled 是否禁用
 */
export async function resetForeignKey(
    em: EntityManager,
    type = 'mysql',
    disabled = true,
): Promise<EntityManager> {
    let key: string;
    let query: string;
    if (type === 'sqlite') {
        key = disabled ? 'OFF' : 'ON';
        query = `PRAGMA foreign_keys = ${key};`;
    } else {
        key = disabled ? '0' : '1';
        query = `SET FOREIGN_KEY_CHECKS = ${key};`;
    }
    await em.query(query);
    return em;
}

/**
 * 数据填充函数
 * 
 *  创建入口填充类的实例
    获取当前数据库连接的配置
    根据配置创建当前数据库连接的连接池
    初始化数据库连接池
    遍历数据工厂函数生成数据工厂列表对象，格式为{模型名: {模型类,处理器}}
    如果不启用事务，则直接运行填充类实例的load方法填充数据（注意，需要忽略外键）
    如果启用事务(默认启用)，则通过事务的方式去填充数据（同样需要忽略外键）
    销毁本次数据库连接实例
 * @param Clazz 填充类
 * @param args 填充命令参数
 * @param spinner Ora雪碧图标
 * @param configure 配置对象
 * @param dbConfig 当前数据库连接池的配置
 */
export async function runSeeder(
    Clazz: SeederConstructor,
    args: SeederOptions,
    spinner: Ora,
    configure: Configure,
    dbConfig: TypeormOption,
): Promise<DataSource> {
    // 创建入口填充类的实例
    const seeder: Seeder = new Clazz(spinner, args);
    // 获取当前数据库连接的配置
    const dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);
    // 初始化数据库连接池
    await dataSource.initialize();
    const factoryMaps: FactoryOptions = {};
    for (const factory of dbConfig.factories) {
        const { entity, handler } = factory();
        factoryMaps[entity.name] = { entity, handler };
    }
    // 如果不启用事务，则直接运行填充类实例的load方法填充数据（注意，需要忽略外键）
    if (typeof args.transaction === 'boolean' && !args.transaction) {
        const em = await resetForeignKey(dataSource.manager, dataSource.options.type);
        await seeder.load({
            factorier: factoryBuilder(configure, dataSource, factoryMaps),
            factories: factoryMaps,
            dataSource,
            em,
            configure,
            connection: args.connection ?? 'default',
            ignoreLock: args.ignorelock,
        });
        await resetForeignKey(em, dataSource.options.type, false);
    } else {
        // 在事务中运行
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const em = await resetForeignKey(queryRunner.manager, dataSource.options.type);
            await seeder.load({
                factorier: factoryBuilder(configure, dataSource, factoryMaps),
                factories: factoryMaps,
                dataSource,
                em,
                configure,
                connection: args.connection ?? 'default',
                ignoreLock: args.ignorelock,
            });
            await resetForeignKey(em, dataSource.options.type, false);
            // 提交事务
            await queryRunner.commitTransaction();
        } catch (err) {
            console.log(err);
            // 遇到错误则回滚
            await queryRunner.rollbackTransaction();
        } finally {
            // 执行事务
            await queryRunner.release();
        }
    }
    // 销毁本次数据库连接实例
    if (dataSource.isInitialized) await dataSource.destroy();
    return dataSource;
}

/**
 * 定义factory用于生成数据
 * @param entity 模型
 * @param handler 处理器
 */
export const defineFactory: DefineFactory = (entity, handler) => () => ({
    entity,
    handler,
});

/**
 * 获取Entity类名
 * entityName函数比较简单，就是通过模型的类名或函数名来获取这个模型的名称 factoryBuilder函数用于返回一个二级柯里化的函数，
 * 返回的函数最终生成一个用于生产数据的DataFactory实例。它接收三个参数，即configure(应用配置实例)、dataSource(数据连接池)以及factories(数据工程列表，
 * 在执行填充命令时由命令处理器传入)
 * @param entity
 */
export function entityName<T>(entity: EntityTarget<T>): string {
    if (entity instanceof Function) return entity.name;
    if (!isNil(entity)) return new (entity as any)().constructor.name;
    throw new Error('Enity is not defined');
}

/**
 * Factory构建器
 * @param configure 配置对象
 * @param dataSource Factory构建器
 * @param factories factory函数组
 */
export const factoryBuilder: DbFactoryBuilder =
    (configure, dataSource, factories) => (entity) => (settings) => {
        const name = entityName(entity);
        if (!factories[name]) {
            throw new Error(`has none factory for entity named ${name}`);
        }
        return new DataFactory(
            name,
            configure,
            entity,
            dataSource.createEntityManager(),
            factories[name].handler,
            settings,
        );
};

/**
 * 模拟数据的生成可以根据我们的配置输出本地化假数据
 * @param configure 
 * @returns 
 */
export const getFakerLocales = async (configure: Configure) => {
    const app = await configure.get<AppConfig>('app');
    const locales: fakerjs.LocaleDefinition[] = [];
    const locale = app.locale as keyof typeof fakerjs;
    const fallbackLocale = app.fallbackLocale as keyof typeof fakerjs;
    if (!isNil(fakerjs[locale])) locales.push(fakerjs[locale] as fakerjs.LocaleDefinition);
    if (!isNil(fakerjs[fallbackLocale]))
        locales.push(fakerjs[fallbackLocale] as fakerjs.LocaleDefinition);
    return locales;
};