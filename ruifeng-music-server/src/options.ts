// src/options.ts
import { existsSync } from 'fs';

import { join } from 'path';

import { NestFactory } from '@nestjs/core';

import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { isNil } from 'lodash';

import * as configs from './config';
import { ContentModule } from './modules/content/content.module';
import { CreateOptions } from './modules/core/types';
import { DatabaseModule } from './modules/database/database.module';
import { MeilliModule } from './modules/meilisearch/melli.module';
import { Restful } from './modules/restful/restful';
import { RestfulModule } from './modules/restful/restful.module';
import { ApiConfig } from './modules/restful/types';
import * as dbCommands from './modules/database/commands';
import { UserModule } from './modules/user/user.module';
// import { JwtAuthGuard } from './modules/user/guards';
import { RbacGuard } from './modules/rbac/guards';
import { RbacModule } from './modules/rbac/rbac.module';

export const createOptions: CreateOptions = {

    commands: () => [...Object.values(dbCommands)],

    config: { factories: configs as any, storage: { enabled: true } },
    modules: async (configure) => [
        DatabaseModule.forRoot(configure),
        MeilliModule.forRoot(configure),
        ContentModule.forRoot(configure),
        RestfulModule.forRoot(configure),
        // 注册用户模块
        UserModule.forRoot(configure),
        RbacModule.forRoot(configure), // 注册rbac模块
    ],
    globals: {
        // 设置全局守卫为JwtAuthGuard
        // guard: JwtAuthGuard,
        guard: RbacGuard,
    },
    builder: async ({ configure, BootModule }) => {
        const container = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        if (!isNil(await configure.get<ApiConfig>('api', null))) {
            const restful = container.get(Restful);
            /**
             * 判断是否存在metadata模块,存在的话则加载并传入factoryDocs
             */
            let metadata: () => Promise<Record<string, any>>;
            if (existsSync(join(__dirname, 'metadata.js'))) {
                metadata = (await import(join(__dirname, 'metadata.js'))).default;
            }
            if (existsSync(join(__dirname, 'metadata.ts'))) {
                metadata = (await import(join(__dirname, 'metadata.ts'))).default;
            }
            await restful.factoryDocs(container, metadata);
        }
        // // 在此处构建swagger文档
        // const restful = container.get(Restful);
        // await restful.factoryDocs(container)
        return container;
    },
};