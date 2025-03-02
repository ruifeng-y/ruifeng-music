// src/modules/database/config.ts

import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';
import { deepMerge } from '../core/helpers';
import { resolve } from 'path';

import { SeedRunner } from './resolver';
import { DbConfig, DbOptions, TypeormOption } from './types';

/**
 * 数据库配置构造器创建
 * @param register
 */
export const createDbConfig: (
    register: ConfigureRegister<RePartial<DbConfig>>,
) => ConfigureFactory<DbConfig, DbOptions> = (register) => ({
    register,
    hook: (configure, value) => createDbOptions(value),
    defaultRegister: () => ({
        common: {
            charset: 'utf8mb4',
            logging: ['error'],
            seedRunner: SeedRunner,
            seeders: [],
            factories: [],
        },
        connections: [],
    }),
});

/**
 * 创建数据库配置
 * @param options 自定义配置
 */
export const createDbOptions = (options: DbConfig) => {
    const newOptions: DbOptions = {
        common: deepMerge(
            {
                charset: 'utf8mb4',
                logging: ['error'],
                // 在启动应用后自动运行迁移
                autoMigrate: true,
                // 添加一个公共的默认配置paths,用于设置迁移文件的路径
                paths: {
                    migration: resolve(__dirname, '../../database/migrations'),
                },
            },
            options.common ?? {},
            'replace',
        ),
        connections: createConnectionOptions(options.connections ?? []),
    };
    newOptions.connections = newOptions.connections.map((connection) => {
        const entities = connection.entities ?? [];
        const newOption = { ...connection, entities };
        return deepMerge(
            newOptions.common,
            {
                ...newOption,
                autoLoadEntities: true,
                // 把每个数据库连接的synchronize强制关闭(防止自定义开启),
                // 这样就能避免自动通过entity去同步表结构以防止生产环境下破坏数据.代之以迁移的方式去安全地更新我们的表结构
                synchronize: false,
            } as any,
            'replace',
        ) as TypeormOption;
    });
    return newOptions;
};