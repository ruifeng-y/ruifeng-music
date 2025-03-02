// src/modules/core/commands/pm2.command.ts
import { Arguments } from 'yargs';

import { CommandItem } from '../types';

import { pm2Handler } from './pm2.handler';
import { Pm2Arguments } from './types';
/**
 * entry: 指定启动的入口文件（相对应用执行的根目录，而不是绝对路径）
*  restart: 重启应用，如果应用的进程不存在则自动启动应用
*  watch: 是否开启监控模式
*  args: 可以加一些课外的启动参数（课程中没用到）
 * @param app 
 * @returns 
 */
export const createPm2Command: CommandItem<any, Pm2Arguments> = async (app) => ({
    // command: 定义了命令的名称，这里是['pm2']。
    command: ['pm2'],
    // 描述了命令的用途，这里是'启动应用'.
    describe: 'Start app in prod by pm2',
    //  定义了命令的参数
    builder: {
        // entry: 脚本路径，默认为dist/main.js。
        entry: {
            type: 'string',
            alias: 'e',
            describe: 'The path of the script to run.',
            default: 'dist/main.js',
        },
        // 是否重启应用，默认为false。
        restart: {
            type: 'boolean',
            alias: 'r',
            describe: 'Retart app, pm2 will auto run start if process not exists.',
            default: false,
        },
        // watch: 是否以观察模式运行，默认为false
        watch: {
            type: 'boolean',
            alias: 'w',
            describe: 'Run in watch mode (live-reload).',
            default: false,
        },
        // args: 传递给脚本的参数，默认为空数组。
        args: {
            type: 'array',
            alias: 'a',
            describe: 'A string or array of strings composed of arguments to pass to the script.',
            default: [],
        },
    },
    // 处理器：handler函数接收命令行参数，并调用pm2Handler函数来处理这些参数，启动或管理应用。
    handler: async (args: Arguments<Pm2Arguments>) => {
        const { configure } = app;
        pm2Handler(configure, args);
    },
});