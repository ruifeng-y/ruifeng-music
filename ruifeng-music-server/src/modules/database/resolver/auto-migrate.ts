// src/modules/database/resolver/auto-migrate.ts
import { join } from 'path';

import { Injectable, OnModuleInit  } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Configure } from '@/modules/config/configure';

import { panic } from '@/modules/core/helpers';

import { TypeormMigrationRun } from '../commands/tyeporm-migration-run';
import { DbConfig } from '../types';

/**
 * 写一个服务，用于在启动应用时遍历每个连接以实现自动运行迁移
 */
@Injectable()
export class AutoMigrate implements OnModuleInit {
    constructor(private moduleRef: ModuleRef) {}
    // 在模块初始化时运行 自动迁移
    // 遍历每个连接，如果 autoMigrate 为 true，则运行迁移
    // 下面写一下在控制台输出日志的代码
    async onModuleInit() {
        console.log('模块初始化，开始自动迁移');
        const configure = this.moduleRef.get(Configure, { strict: false });
        const { connections = [] }: DbConfig = await configure.get<DbConfig>('database');
        for (const connect of connections) {
            let dataSource: DataSource | undefined;
            if (connect.autoMigrate) {
                try {
                    const runner = new TypeormMigrationRun();
                    dataSource = new DataSource(connect as DataSourceOptions);
                    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
                    dataSource.setOptions({
                        subscribers: [],
                        synchronize: false,
                        migrationsRun: false,
                        logging: ['error'],
                        migrations: [
                            join(connect.paths.migration, '**/*.ts'),
                            join(connect.paths.migration, '**/*.js'),
                        ],
                        dropSchema: false,
                    });
                    await dataSource.initialize();
                    await runner.handler({
                        dataSource,
                    });
                } catch (error) {
                    if (dataSource && dataSource.isInitialized) await dataSource.destroy();
                    panic({ message: 'Run migrations failed!', error });
                }
            }
        }
    }
}