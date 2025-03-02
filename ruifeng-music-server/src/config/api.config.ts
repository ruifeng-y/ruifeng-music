// src/config/api.config.ts
import { Configure } from '@/modules/config/configure';
import { ConfigureFactory } from '@/modules/config/types';

import { createContentApi } from '@/modules/content/routes';
// import { createRbacApi } from '@/modules/rbac/routes';
import { ApiConfig, VersionOption } from '@/modules/restful/types';
// import { createUserApi } from '@/modules/user/routes';
// import * as contentControllers from '@/modules/content/controllers';
import { createUserApi } from '@/modules/user/routes';
import { createRbacApi } from '@/modules/rbac/routes';

export const v1 = async (configure: Configure): Promise<VersionOption> => {
    const contentApi = createContentApi();
    const userApi = createUserApi();
    const rbacApi = createRbacApi();
    return {
        routes: [
            {
                name: 'app',
                path: '/',
                controllers: [],
                doc: {
                    // title: '应用接口',
                    description:
                        '3R教室《Nestjs实战开发》课程应用的客户端接口（应用名称随机自动生成）',
                    // tags: [
                    //     { name: '分类操作', description: '对分类进行CRUD操作' },
                    //     { name: '标签操作', description: '对标签进行CRUD操作' },
                    //     { name: '文章操作', description: '对文章进行CRUD操作' },
                    //     { name: '评论操作', description: '对评论进行CRUD操作' },
                    //     // 我们可以通过函数快速获得用户模块的API（包括标签和路由），并放到我们的api配置中
                    //     ...userApi.tags.app,
                    // ],
                    tags: [...contentApi.tags.app, ...userApi.tags.app],
                    
                },
                // children: [
                //     {
                //         name: 'app.content',
                //         path: 'content',
                //         controllers: Object.values(contentControllers),
                //     },
                //     //  我们可以通过函数快速获得用户模块的API（包括标签和路由），并放到我们的api配置中
                //     ...userApi.routes.app,
                // ],
                children: [...contentApi.routes.app, ...userApi.routes.app],
            },
            {
                name: 'manage',
                path: 'manage',
                controllers: [],
                doc: {
                    description:
                        '3R教室《Nestjs实战开发》课程应用的应用的后台管理接口（应用名称随机自动生成）',
                    tags: [
                        ...contentApi.tags.manage,
                        ...userApi.tags.manage,
                        ...rbacApi.tags.manage,
                    ],
                },
                children: [
                    ...contentApi.routes.manage,
                    ...userApi.routes.manage,
                    ...rbacApi.routes.manage,
                ],
            },
        ],
    };
};

export const api: ConfigureFactory<ApiConfig> = {
    register: async (configure: Configure) => ({
        title: configure.env.get(
            'API_TITLE',
            `${await configure.get<string>('app.name')} app的API接口`,
        ),
        // description: configure.env.get('API_DESCRIPTION', '3R教室TS全栈开发教程'),
        auth: true,
        docuri: 'api/docs',
        default: configure.env.get('API_DEFAULT_VERSION', 'v1'),
        enabled: [],
        versions: { v1: await v1(configure) },
    }),
};