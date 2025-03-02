// src/modules/database/base/seeder.ts
import { isNil } from 'lodash';
import { Ora } from 'ora';
import { DataSource, EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';

import { Configure } from '@/modules/config/configure';

import { panic } from '@/modules/core/helpers';

import {
    DbFactory,
    DbFactoryOption,
    Seeder,
    SeederConstructor,
    SeederLoadParams,
    SeederOptions,
} from '../commands/types';
import { factoryBuilder } from '../helpers';
import { DbConfig } from '../types';

/**
 * 数据填充基类
 * 以下是该类的属性
 * dataSource属性: 数据连接池
 * em属性: entity manager
 * configure属性: 配置类的实例
 * truncates属性: 在执行Seed时需要清空的数据表对应的模型类
 * ignoreLock属性: 本次执行是否忽略已执行过的填充类，如果忽略，将清空该次执行的填充类设置的模型对应的表数据
 */
export abstract class BaseSeeder implements Seeder {
    protected dataSource: DataSource;

    protected em: EntityManager;

    protected connection = 'default';

    protected configure: Configure;

    protected ignoreLock = false;

    protected truncates: EntityTarget<ObjectLiteral>[] = [];

    protected factories: {
        [entityName: string]: DbFactoryOption<any, any>;
    };

    constructor(
        protected readonly spinner: Ora,
        protected readonly args: SeederOptions,
    ) {}

    /**
     * 清空原数据并重新加载数据
     * 该方法的执行逻辑为
     * 设置数据库连接名，连接池，em，配置类实例
     * 判断当前运行环境是否为生产环境
     * 如果不是在生产环境下，则在运行填充之前先根据truncates属性把原来的数据表中的数据给清空掉
     * 调用run方法运行迁移
     * @param params
     */
    async load(params: SeederLoadParams): Promise<any> {
        const { factorier, factories, dataSource, em, connection, configure, ignoreLock } = params;
        this.connection = connection;
        this.dataSource = dataSource;
        this.em = em;
        this.configure = configure;
        this.ignoreLock = ignoreLock;
        this.factories = factories;
        if (this.ignoreLock) {
            for (const truncate of this.truncates) {
                await this.em.clear(truncate);
            }
        }

        const result = await this.run(factorier, this.dataSource);
        return result;
    }

    protected async getDbConfig() {
        const { connections = [] }: DbConfig = await this.configure.get<DbConfig>('database');
        const dbConfig = connections.find(({ name }) => name === this.connection);
        if (isNil(dbConfig)) panic(`Database connection named ${this.connection} not exists!`);
        return dbConfig;
    }

    /**
     * 运行seeder的关键方法
     * 这里放置填充数据的具体执行逻辑，目前只接收dataSource和em两个参数，下面我们也会添加factories参数,用于获取数据工厂
     * @param factorier
     * @param dataSource
     */
    protected abstract run(
        factorier?: DbFactory,
        dataSource?: DataSource,
        em?: EntityManager,
    ): Promise<any>;

    /**
     * 运行子seeder
     * 在此方法内调用子Seeder
     * @param SubSeeder
     */
    protected async call(SubSeeder: SeederConstructor) {
        const subSeeder: Seeder = new SubSeeder(this.spinner, this.args);
        await subSeeder.load({
            connection: this.connection,
            factorier: factoryBuilder(this.configure, this.dataSource, this.factories),
            factories: this.factories,
            dataSource: this.dataSource,
            em: this.em,
            configure: this.configure,
            ignoreLock: this.ignoreLock,
        });
    }
}