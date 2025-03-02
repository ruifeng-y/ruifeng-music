// src/modules/restful/restful.module.ts
import { Module } from '@nestjs/common';

import { Configure } from '../config/configure';

import { Restful } from './restful';
// 编写一个Restful模块，用于导入路由模块以及设置Restful这个提供者
@Module({})
export class RestfulModule {
    static async forRoot(configure: Configure) {
        const restful = new Restful(configure);
        await restful.create(await configure.get('api'));
        return {
            module: RestfulModule,
            global: true,
            imports: restful.getModuleImports(),
            providers: [
                {
                    provide: Restful,
                    useValue: restful,
                },
            ],
            exports: [Restful],
        };
    }
}