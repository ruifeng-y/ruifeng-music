// src/modules/database/commands/types.ts
import { Ora } from 'ora';
import { DataSource, EntityManager, EntityTarget, ObjectType } from 'typeorm';
import { Arguments } from 'yargs';

import { Configure } from '@/modules/config/configure';

import { DataFactory } from '../resolver/data.factory';

/** ****************************** 数据迁移 **************************** */

/**
 * 基础数据库命令参数类型
 */
export type TypeOrmArguments = Arguments<{
    connection?: string;
}>;

/**
 * 创建迁移命令参数
 */
export type MigrationCreateArguments = TypeOrmArguments & MigrationCreateOptions;

/**
 * 创建迁移处理器选项
 */
export interface MigrationCreateOptions {
    name: string;
}

/**
 * 生成迁移命令参数
 */
export type MigrationGenerateArguments = TypeOrmArguments & MigrationGenerateOptions;

/**
 * 生成迁移处理器选项
 * connection: 数据库连接名称，默认为default ，默认: default
 * name: 手动指定迁移文件的类名（即文件名）, 默认: 自动生成
 * pretty: 是否打印生成的迁移文件所要执行的SQL，默认：false
 * dryrun: 是否只打印生成的迁移文件的内容而不是直接生成迁移文件，默认: false
 * check: 是否只验证数据库是最新的而不是直接生成迁移，默认: false
 * run: 这与下面的运行迁移结合起来使用，请看下一部分
 */
export interface MigrationGenerateOptions {
    name?: string;
    run?: boolean;
    pretty?: boolean;
    dryrun?: boolean;
    check?: boolean;
}


/**
 *  
 * 运行迁移
    运行迁移命令可以把生成的迁移文件的内容同步到数据库中，这样我们每次在更改模型时生成一个新的迁移文件，然后运行一下迁移来使数据库永远保持最新状态
    类型
    运行迁移命令的参数类型除了公共类型TypeOrmArguments外，还继承了回滚迁移命令参数的MigrationRevertOptions类型，具体如下

    connection: 链接名称，默认为default
    transaction: 运行迁移的事务名称，默认为default
    fake：如果数据库表结构已经被更改，是否需要模拟运行迁移，默认为false
    refresh: 是否刷新数据库，即删除所有表结构后重新运行（生产环境下不可用），默认为false
    onlydrop：只删除数据库表结构而不运行（生产环境下不可用），默认为false

 */
/**
 * 运行迁移的命令参数
 */
export type MigrationRunArguments = TypeOrmArguments & MigrationRunOptions;

/**
 * 运行迁移处理器选项
 */
export interface MigrationRunOptions extends MigrationRevertOptions {
    refresh?: boolean;
    onlydrop?: boolean;
}

/**
 * 恢复迁移处理器选项
 */
export interface MigrationRevertOptions {
    transaction?: string;
    fake?: boolean;
}


/**
 * 回滚迁移
   回滚迁移一般用于运行当前最新的迁移文件导致数据库错误或者崩溃时把表结构回滚到上一次的迁移状态，写法与上述命令大同小异，此处不再赘述，
 */


/**
 * 恢复迁移的命令参数
 */
export type MigrationRevertArguments = TypeOrmArguments & MigrationRevertOptions;




/** ****************************** 数据填充 **************************** */


/**
 * 数据填充处理器选项
 */
export interface SeederOptions {
    connection?: string;
    transaction?: boolean;
    ignorelock?: boolean;
}

/**
 * 数据填充类接口
 */
export interface SeederConstructor {
    new (spinner: Ora, args: SeederOptions): Seeder;
}

/**
 * 数据填充类方法对象
 */
export interface Seeder {
    load: (params: SeederLoadParams) => Promise<void>;
}

/**
 * 数据填充类的load函数参数
 */
export interface SeederLoadParams {
    /**
     * 数据库连接名称
     */
    connection: string;
    /**
     * 数据库连接池
     */
    dataSource: DataSource;

    /**
     * EntityManager实例
     */
    em: EntityManager;

    /**
     * 项目配置类
     */
    configure: Configure;

    /**
     * 是否忽略锁定
     */
    ignoreLock: boolean;

    /**
     * Factory解析器
     */
    factorier?: DbFactory;
    /**
     * Factory函数列表
     */
    factories: FactoryOptions;
}


/**
 * 工厂定义
    编写一个工厂定义函数defineFactory，该函数接收两个参数，分别为模型类和其绑定的工厂函数，其中工厂函数用于编写生成模拟数据的逻辑 defineFactory函数的返回值是一个函数，
    该值函数的作用就在于执行时会生成一个模型和工厂函数的对象
    defineFactory函数的类型为DefineFactory
    defineFactory的handler参数（工厂函数）的类型为DbFactoryHandler，该函数接收两个参数，configure配置实例以及自定义选项，并返回一个赋值模拟数据后的模型对象
    defineFactory的返回值函数执行后的返回值为DbFactoryOption类型，他是一个拥有entity模型类以及handler工厂函数的对象
 */
export type SeederArguments = TypeOrmArguments & SeederOptions;

export type DefineFactory = <E, O>(
    entity: ObjectType<E>,
    handler: DbFactoryHandler<E, O>,
) => () => DbFactoryOption<E, O>;

export type DbFactoryHandler<E, O> = (configure: Configure, options: O) => Promise<E>;

export type DbFactoryOption<E, O> = {
    entity: ObjectType<E>;
    handler: DbFactoryHandler<E, O>;
};

/**
 * Factory解析器
 */
export interface DbFactory {
    <Entity>(
        entity: EntityTarget<Entity>,
    ): <Options>(options?: Options) => DataFactory<Entity, Options>;
}

/**
 * 数据填充函数映射对象
 */
export type FactoryOptions = {
    [entityName: string]: DbFactoryOption<any, any>;
};

/**
 * Factory构造器
 */
export type DbFactoryBuilder = (
    configure: Configure,
    dataSource: DataSource,
    factories: {
        [entityName: string]: DbFactoryOption<any, any>;
    },
) => DbFactory;

