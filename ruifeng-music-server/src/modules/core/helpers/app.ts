// src/modules/core/helpers/app.ts
import { BadGatewayException, Global, Module, ModuleMetadata, Type } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { isNil, omit } from 'lodash';
import { ConfigModule } from '@/modules/config/config.module';
import { Configure } from '@/modules/config/configure';
import { CoreModule } from '../core.module';
import { AppFilter, AppIntercepter, AppPipe } from '../providers';
import { App, AppConfig, CreateOptions } from '../types';
import { createCommands } from './command';
import { CreateModule } from './utils';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

/**
 * app实例常量
 */
export const app: App = { configure: new Configure(), commands: [] };

/**
 * 创建一个应用
 * @param options 创建选项
 */
export const createApp = (options: CreateOptions) => async (): Promise<App> => {
    const { config, builder } = options;
    // 初始化配置实例
    await app.configure.initilize(config.factories, config.storage);

    // 输出配置以供调试
    // console.log('Configuration:', app.configure);

    // console.log('database:', app.configure.has('database'));


    // 如果没有app配置则使用默认配置
    if (!app.configure.has('app')) {
        throw new BadGatewayException('App config not exists!');
    }
    // 创建启动模块
    const BootModule = await createBootModule(app.configure, options);
    // 创建app的容器实例
    app.container = await builder({
        configure: app.configure,
        BootModule,
    });
    // 设置api前缀
    // if (app.configure.has('app.prefix')) {
    //     app.container.setGlobalPrefix(await app.configure.get<string>('app.prefix'));
    // }
    // 为class-validator添加容器以便在自定义约束中可以注入dataSource等依赖
    useContainer(app.container.select(BootModule), {
        fallbackOnErrors: true,
    });
    // 在app创建后把命令解析出来
    app.commands = await createCommands(options.commands, app as Required<App>);
    return app;
};

/**
 * 构建一个启动模块
 * @param params
 * @param options
 */
export async function createBootModule(
    configure: Configure,
    options: Pick<CreateOptions, 'globals' | 'providers' | 'modules'>,
): Promise<Type<any>> {
    const { globals = {}, providers = [] } = options;
    // 获取需要导入的模块
    const modules = await options.modules(configure);
    const imports: ModuleMetadata['imports'] = (
        await Promise.all([
            ...modules,
            ConfigModule.forRoot(configure),
            await CoreModule.forRoot(configure),
        ])
    ).map((item) => {
        if ('module' in item) {
            const meta = omit(item, ['module', 'global']);
            Module(meta)(item.module);
            if (item.global) Global()(item.module);
            return item.module;
        }
        return item;
    });
    // 配置全局提供者
    if (globals.pipe !== null) {
        const pipe = globals.pipe
            ? globals.pipe(configure)
            : new AppPipe({
                  transform: true,
                  whitelist: true,
                  forbidNonWhitelisted: true,
                  forbidUnknownValues: true,
                  validationError: { target: false },
              });
        providers.push({
            provide: APP_PIPE,
            useValue: pipe,
        });
    }
    if (globals.interceptor !== null) {
        providers.push({
            provide: APP_INTERCEPTOR,
            useClass: globals.interceptor ?? AppIntercepter,
        });
    }
    if (globals.filter !== null) {
        providers.push({
            provide: APP_FILTER,
            useClass: AppFilter,
        });
    }

    // 为启动模块添加一个APP_GUARD的提供者用于设置全局守卫
    if (!isNil(globals.guard)) {
        providers.push({
            provide: APP_GUARD,
            useClass: globals.guard,
        });
    }

    return CreateModule('BootModule', () => {
        const meta: ModuleMetadata = {
            imports,
            providers,
        };
        return meta;
    });
}

/**
 * 构建APP CLI,默认start命令应用启动监听app
 * @param creator APP构建器
 * @param listened 监听回调
 */
export async function startApp(
    creator: () => Promise<App>,
    listened?: (app: App, startTime: Date) => () => Promise<void>,
) {
    const startTime = new Date();
    const { container, configure } = await creator();
    app.container = container;
    app.configure = configure;
    const { port, host } = await configure.get<AppConfig>('app');
    await container.listen(port, host, listened(app, startTime));
}


// /**
//  * 输出API地址
//  * @param factory
//  */
// export async function echoApi(configure: Configure, container: NestFastifyApplication) {
//     const appUrl = await configure.get<string>('app.url');
//     // 设置应用的API前缀,如果没有则与appUrl相同
//     const urlPrefix = await configure.get('app.prefix', undefined);
//     const apiUrl = !isNil(urlPrefix)
//         ? `${appUrl}${urlPrefix.length > 0 ? `/${urlPrefix}` : urlPrefix}`
//         : appUrl;
//     console.log(`- RestAPI: ${chalk.green.underline(apiUrl)}`);
// }

// /**
//  * 启动信息打印
//  * @param app
//  * @param startTime
//  */
// export const listened: (app: App, startTime: Date) => () => Promise<void> =
//     ({ configure, container }, startTime) =>
//     async () => {
//         console.log();
//         await echoApi(configure, container);
//         console.log('used time:', chalk.cyan(`${new Date().getTime() - startTime.getTime()}`));
// };