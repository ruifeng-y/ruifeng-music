import { Arguments } from 'yargs';

import { CommandItem } from '../types';

import { DemoCommandArguments } from './types';

// 导出一个名为DemoCommand的命令项，类型为CommandItem<any, DemoCommandArguments>
export const DemoCommand: CommandItem<any, DemoCommandArguments> = async (app) => ({
    // 为执行后即退出进程的瞬时应用
    instant: true,
    // 命令名称和别名
    command: ['demo', 'd'],
    // 命令描述
    describe: 'A demo command',
    // 命令参数
    builder: {
        // 是否睡眠
        sleep: {
            type: 'boolean',
            alias: 's',
            describe: ' App will sleep?',
            default: false,
        },
    },
    // 命令处理函数
    handler: async (args: Arguments<DemoCommandArguments>) => {
        // 获取app配置
        const { configure } = app;
        // 获取app名称
        const appName = await configure.get<string>('app.name');
        // 判断是否睡眠
        const sleep = args.sleep ? ' will to sleep' : '';
        // 打印信息
        console.log(`It's just a demo command, My app ${appName}${sleep}`);
    },
});