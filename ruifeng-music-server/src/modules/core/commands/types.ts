import { StartOptions } from 'pm2';

// 导出一个类型DemoCommandArguments，它是一个对象类型，包含一个可选的boolean类型的属性sleep
export type DemoCommandArguments = {
    sleep?: boolean;
};

/**
 * 命令参数
 */
export type Pm2Arguments = {
    /**
     * 应用入口文件，默认为dist/main.js
     */
    entry?: string;

    /**
     * 是否监控,所有环境都可以使用(但在非PM2启动的生产环境下此选项无效)
     */
    watch?: boolean;

    /**
     * 是否重启应用(PM2进程)
     */
    restart?: boolean;

    /**
     * 是否执行额外命令
     */
    args?: string[];
};

/**
 * PM2配置
 * 命令处理选项（排除了几个pm2默认的StartOptions类型中的几个属性，因为这些属性我们在应用配置里添加）
 */
// 定义Pm2Option类型，该类型是Pm2Arguments类型的子集，包含watch和args属性
// 同时，该类型是StartOptions类型的子集，但不包含name、cwd、script、args和interpreter属性
export type Pm2Option = Pick<Pm2Arguments, 'watch' | 'args'> &
    Omit<StartOptions, 'name' | 'cwd' | 'script' | 'args' | 'interpreter' | 'watch'>;
