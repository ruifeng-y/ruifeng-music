// src/modules/restful/helpers.ts
import { Type } from '@nestjs/common';
import { RouteTree, Routes } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApiTags } from '@nestjs/swagger';
import chalk from 'chalk';
import { trim, omit, upperFirst, camelCase, isNil } from 'lodash';

import { Configure } from '../config/configure';

import { CreateModule } from '../core/helpers';

import { App } from '../core/types';

import { CONTROLLER_DEPENDS } from './constants';
import { Restful } from './restful';
import { RouteOption } from './types';
import { APIDocOption } from './types';
/**
 * 路由路径前缀处理
 * @param routePath
 * @param addPrefix
 */
export const trimPath = (routePath: string, addPrefix = true) =>
    `${addPrefix ? '/' : ''}${trim(routePath.replace('//', '/'), '/')}`;

/**
 * 遍历路由及其子孙路由以清理路径前缀
 * @param data
 */
export const getCleanRoutes = (data: RouteOption[]): RouteOption[] =>
    data.map((option) => {
        const route: RouteOption = {
            ...omit(option, 'children'),
            path: trimPath(option.path),
        };
        if (option.children && option.children.length > 0) {
            route.children = getCleanRoutes(option.children);
        } else {
            delete route.children;
        }
        return route;
});

/**
 * 生成最终路由路径(为路由路径添加自定义及版本前缀)
 * @param routePath
 * @param prefix
 * @param version
 */
export const genRoutePath = (routePath: string, prefix?: string, version?: string) => {
    const addVersion = `${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`;
    return isNil(prefix) ? trimPath(addVersion) : trimPath(`${prefix}${addVersion}`);
};

/**
 * 此函数用于构建路由模块，其逻辑如下
 * 根据生成路由模块名称对应的key，key值为{父模块名}.{当前的路由集名}
 * 判断模块名是否唯一
 * 把每个控制器的依赖模块导入到生成的路由模块
 * 生成路由模块，模块的类名使用首字母大写的驼峰命名
 * 把生成的模块放入模块列表，这是为了循环和递归时进行对比，防止路由模块重名（注意，此参数与BaseRestful类的对象的_modules属性绑定）
 * 如果有子路由集，则递归执行
 * 最后返回路由树
 * @param configure 
 * @param modules 
 * @param routes 
 * @param parentModule 
 * @returns 
 */
export const createRouteModuleTree = (
    configure: Configure,
    modules: { [key: string]: Type<any> },
    routes: RouteOption[],
    parentModule?: string,
): Promise<Routes> =>
    Promise.all(
        routes.map(async ({ name, path, children, controllers, doc }) => {
            // 自动创建路由模块的名称
            const moduleName = parentModule ? `${parentModule}.${name}` : name;
            // RouteModule的名称必须唯一
            if (Object.keys(modules).includes(moduleName)) {
                throw new Error('route name should be unique in same level!');
            }
            // 获取每个控制器的依赖模块
            const depends = controllers
                .map((c) => Reflect.getMetadata(CONTROLLER_DEPENDS, c) || [])
                .reduce((o: Type<any>[], n) => [...o, ...n], [])
                .reduce((o: Type<any>[], n: Type<any>) => {
                    if (o.find((i) => i === n)) return o;
                    return [...o, n];
                }, []);
            // 为每个没有自己添加`ApiTags`装饰器的控制器添加Tag
            if (doc?.tags && doc.tags.length > 0) {
                controllers.forEach((controller) => {
                    !Reflect.getMetadata('swagger/apiUseTags', controller) &&
                        ApiTags(
                            ...doc.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name))!,
                        )(controller);
                });
            }
            // 创建路由模块,并导入所有控制器的依赖模块
            const module = CreateModule(`${upperFirst(camelCase(name))}RouteModule`, () => ({
                controllers,
                imports: depends,
            }));
            // 在modules变量中追加创建的RouteModule,防止重名
            modules[moduleName] = module;
            const route: RouteTree = { path, module };
            // 如果有子路由则进一步处理
            if (children)
                route.children = await createRouteModuleTree(
                    configure,
                    modules,
                    children,
                    moduleName,
                );
            return route;
        }),
);

/**
 * 生成最终文档路径
 * @param routePath
 * @param prefix
 * @param version
 */
export const genDocPath = (routePath: string, prefix?: string, version?: string) =>
    trimPath(`${prefix}${version ? `/${version.toLowerCase()}/` : '/'}${routePath}`, false);

// src/modules/restful/helpers.ts
/**
 * 输出API和DOC地址
 * @param factory
 */
export async function echoApi(configure: Configure, container: NestFastifyApplication) {
    const appUrl = await configure.get<string>('app.url');
    // 设置应用的API前缀,如果没有则与appUrl相同
    const urlPrefix = await configure.get('app.prefix', undefined);
    const apiUrl = !isNil(urlPrefix)
        ? `${appUrl}${urlPrefix.length > 0 ? `/${urlPrefix}` : urlPrefix}`
        : appUrl;
    console.log(`- RestAPI: ${chalk.green.underline(apiUrl)}`);
    console.log('- RestDocs:');
    const factory = container.get(Restful);
    const { default: defaultDoc, ...docs } = factory.docs;
    await echoApiDocs('default', defaultDoc, appUrl);
    for (const [name, doc] of Object.entries(docs)) {
        console.log();
        echoApiDocs(name, doc, appUrl);
    }
}

/**
 * 启动信息打印
 * @param app
 * @param startTime
 */
export const listened: (app: App, startTime: Date) => () => Promise<void> =
    ({ configure, container }, startTime) =>
    async () => {
        console.log();
        await echoApi(configure, container);
        console.log('used time:', chalk.cyan(`${new Date().getTime() - startTime.getTime()}`));
};

/**
 * 输出一个版本的API和DOC地址
 * @param name
 * @param doc
 * @param appUrl
 */
async function echoApiDocs(name: string, doc: APIDocOption, appUrl: string) {
    const getDocPath = (dpath: string) => `${appUrl}/${dpath}`;
    if (!doc.routes && doc.default) {
        console.log(
            `    [${chalk.blue(name.toUpperCase())}]: ${chalk.green.underline(
                getDocPath(doc.default.path),
            )}`,
        );
        return;
    }
    console.log(`    [${chalk.blue(name.toUpperCase())}]:`);
    if (doc.default) {
        console.log(`      default: ${chalk.green.underline(getDocPath(doc.default.path))}`);
    }
    if (doc.routes) {
        Object.entries(doc.routes).forEach(([_routeName, rdocs]) => {
            console.log(
                `      <${chalk.yellowBright.bold(rdocs.title)}>: ${chalk.green.underline(
                    getDocPath(rdocs.path),
                )}`,
            );
        });
    }
}
