// src/modules/core/types.ts
import { ModuleMetadata, PipeTransform, Type } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Configure } from '../config/configure';
import { ConfigStorageOption, ConfigureFactory } from '../config/types';
import { StartOptions } from 'pm2';
import { CommandModule } from 'yargs';
import { Ora } from 'ora';
import dayjs from 'dayjs';
import { IAuthGuard } from '@nestjs/passport';

/**
 * 应用配置
 */
export interface AppConfig {
    /**
     * App名称
     */
    name: string;
    /**
     * 主机地址,默认为127.0.0.1
     */
    host: string;
    /**
     * 监听端口,默认3100
     */
    port: number;
    /**
     * 是否开启https,默认false
     */
    https: boolean;
    /**
     * 时区,默认Asia/Shanghai
     */
    timezone: string;
    /**
     * 语言,默认zh-cn
     */
    locale: string;
    /**
     * 备用语言
     */
    fallbackLocale: string;
    /**
     * 控制台打印的url,默认自动生成
     */
    url?: string;
    /**
     * 由url+api前缀生成的基础api url
     */
    prefix?: string;

    /**
     * PM2配置
     * TypeScript类型系统：这段代码使用了TypeScript的类型系统来定义pm2属性的类型。Omit是一个TypeScript内置的工具类型，用于从另一个类型中排除某些属性。
     * StartOptions类型：StartOptions是一个预定义的类型，通常用于描述PM2启动进程时的配置选项。这些选项可能包括进程名称、工作目录、脚本路径、命令行参数、解释器等。
     * StartOptions类型：StartOptions是一个预定义的类型，通常用于描述PM2启动进程时的配置选项。这些选项可能包括进程名称、工作目录、脚本路径、命令行参数、解释器等。
     * 
     */
    pm2?: Omit<StartOptions, 'name' | 'cwd' | 'script' | 'args' | 'interpreter' | 'watch'>;
    // /**
    //  * 备用语言
    //  */
    // fallback_locale: string;
}


/**
 * App对象类型
 */
export type App = {
    // 应用容器实例
    container?: NestFastifyApplication;

    // 配置类实例
    configure: Configure;

    /**
     * 命令列表
     * 给APP类型也添加一个命令类型，当然这边的命令是已经同构命令构造函数生成可直接传入yargs使用的命令模块
     */
    commands: CommandModule<RecordAny, RecordAny>[];
};

/**
 * 创建应用的选项参数
 */
export interface CreateOptions {
    /**
     * 应用命令
     */
    commands: () => CommandCollection;

    /**
     * 返回值为需要导入的模块
     */
    modules: (configure: Configure) => Promise<Required<ModuleMetadata['imports']>>;
    /**
     * 应用构建器
     */
    builder: ContainerBuilder;
    /**
     * 全局配置
     */
    globals?: {
        /**
         * 全局管道,默认为AppPipe,设置为null则不添加
         * @param params
         */
        pipe?: (configure: Configure) => PipeTransform<any> | null;
        /**
         * 全局拦截器,默认为AppInterceptor,设置为null则不添加
         */
        interceptor?: Type<any> | null;
        /**
         * 全局过滤器,默认AppFilter,设置为null则不添加
         */
        filter?: Type<any> | null;
        /**
         * 全局守卫
         * 为了使所有API默认必须通过JWT守卫，也就是登录后才能访问（除了加了@Guest这个装饰器的）
         */
        guard?: Type<IAuthGuard>;
    };
  
    providers?: ModuleMetadata['providers'];

    /**
     * 配置选项
     */
    config: {
        /**
         * 初始配置集
         */
        factories: Record<string, ConfigureFactory<Record<string, any>>>;
        /**
         * 配置服务的动态存储选项
         */
        storage: ConfigStorageOption;
    };
}

/**
 * 应用构建器
 */
export interface ContainerBuilder {
    (params: { configure: Configure; BootModule: Type<any> }): Promise<NestFastifyApplication>;
}

/**
 * 控制台错误函数panic的选项参数
 */
export interface PanicOption {
    /**
     * 报错消息
     */
    message: string;
    /**
     * 抛出的异常信息
     */
    error?: any;
    /**
     * 是否退出进程
     */
    exit?: boolean;
     /**
     * ora对象
     * 使用ora为某些延时命令添加正在执行中的命令行雪碧图
     */
     spinner?: Ora;
}

// src/modules/core/helpers/command.ts
// /**
//  * 输出命令行错误消息
//  * @param option
//  */
// export async function panic(option: PanicOption | string) {
//     console.log();
//     if (typeof option === 'string') {
//         console.log(chalk.red(`\n❌ ${option}`));
//         process.exit(1);
//     }
//     const { error, message, exit = true } = option;
//     !isNil(error) ? console.log(chalk.red(error)) : console.log(chalk.red(`\n❌ ${message}`));
//     if (exit) process.exit(1);
// }

/**
 * 因为在命令中需要启动一个nestjs实例，对于一些即时运行的命令，比如数据迁移等，需要在运行后退出进程。否则，虽然就算实例关闭了，命令窗口还会卡在那边，因为进程没有结束掉
 * 所以，除了继承yargs默认的CommandModule命令模块选项外，还需要添加一个instant用于设置瞬时命令
 */
export interface CommandOption<T = RecordAny, U = RecordAny> extends CommandModule<T, U> {
    /**
     * 是否为执行后即退出进程的瞬时应用
     */
    instant?: boolean;
}

/**
 * 该类型是命令构造函数的类型，这个函数在执行后将生成一个yargs命令模块，在参数中传入app，它包含了
 * 当前运行的nest实例:container
 * 配置模块实例: configure
 * 以及所有的命令模块: commands
 */
export type CommandItem<T = Record<string, any>, U = Record<string, any>> = (
    app: Required<App>,
) => Promise<CommandOption<T, U>>;

/**
 * 这是命令构造器的列表数组类型
 */
export type CommandCollection = Array<CommandItem<any, any>>;

/**
 * 为了可以快捷的获取dayjs的时间对象，我们添加一个时间函数 首先定义一个时间参数选项类型
 * date: 时间属性，如果不传入则获取当前属性
 * format: 输出时间格式，具体可以参考dayjs的文档
 * locale: 语言，如果不传入则使用app配置中设置的默认语言
 * strict: 是否开启严格模式
 * zonetime: 时区。如果不传入则使用app配置中设置的默认时区
 */
export interface TimeOptions {
    date?: dayjs.ConfigType;
    format?: dayjs.OptionType;
    locale?: string;
    strict?: boolean;
    zonetime?: string;
}

/**
 * 模块构建器参数选项
 */
export type ModuleBuilderMeta = ModuleMetadata & {
    global?: boolean;
    commands?: CommandCollection;
};

/**
 * 模块构建器
 */
export type ModuleMetaRegister<P extends Record<string, any>> = (
    configure: Configure,
    params: P,
) => ModuleBuilderMeta | Promise<ModuleBuilderMeta>;

/**
 * 嵌套对象
 */
export type NestedRecord = Record<string, Record<string, any>>;