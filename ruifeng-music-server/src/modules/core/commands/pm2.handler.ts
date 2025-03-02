// src/modules/core/commands/pm2.handler.ts
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { exit } from 'process';

import chalk from 'chalk';
import { isNil, pick, omit } from 'lodash';
import pm2, { StartOptions } from 'pm2';

import { Arguments } from 'yargs';

import { Configure } from '@/modules/config/configure';

import { deepMerge, panic } from '../helpers';
import { AppConfig } from '../types';

import { Pm2Arguments, Pm2Option } from './types';

/**
 * 
 * 先编写一个获取pm2配置的函数

 * 先判断入口文件是否存在，不存在则报错
 * 设置默认配置defaultConfig：通过一些固定的选项以及从命令行中传入的选项(option参数)得出
 * 再用在app.config.ts中的自定义pm2配置覆盖合并默认配置以获取最终配置
 * @param configure 一个配置对象，用于获取应用程序的配置信息。
 * @param option 包含PM2启动选项的对象。
 * @param script 应用程序的入口脚本文件名。
 * @returns 
 */
export const getPm2Config = async (
    configure: Configure,
    option: Pm2Option,
    script: string,
): Promise<StartOptions> => {
    // 检查脚本文件是否存在 使用existsSync函数检查当前工作目录（cwdPath）下是否存在指定的脚本文件。
    if (!existsSync(join(cwdPath, script)))
        // 如果文件不存在，则调用panic函数并输出错误信息，使用chalk库将错误信息高亮显示为红色。
        panic(chalk.red(`entry script file '${join(cwdPath, script)}' not exists!`));
    // 获取应用程序配置 使用configure.get方法异步获取应用程序的配置信息，配置项名为app。解构出name和pm2配置，如果pm2配置不存在，则默认为空对象。      
    const { name, pm2: customConfig = {} } = await configure.get<AppConfig>('app');
    // 定义一个defaultConfig对象，包含PM2启动的默认配置。
    const defaultConfig: StartOptions = {
        name, // 应用程序名称
        cwd: cwdPath,  // 当前工作目录
        script,  // 应用程序的入口脚本文件名
        args: option.args,  // 传入的命令行参数
        autorestart: true,  // 是否自动重启
        watch: option.watch,  // 是否监视文件变化
        ignore_watch: ['node_modules'], // 忽略监视的文件或目录
        env: process.env, // 环境变量
        exec_mode: 'fork',  // 执行模式
    };
    // 合并配置 使用deepMerge函数将默认配置和自定义配置合并。
    return deepMerge(
        defaultConfig,
        // 使用omit函数从自定义配置(customConfig)中删除name、cwd、script、args、watch和interpreter属性。
        omit(customConfig, ['name', 'cwd', 'script', 'args', 'watch', 'interpreter']),
        'replace',// 合并策略为replace，即自定义配置会覆盖默认配置。
    );
};

/**
 * 执行路径(应用根目录)
 */
const cwdPath = resolve(__dirname, '../../../..');

/**
 * PM2静默应用启动处理器
 * 获取应用名称作为pm2进程
 * 尝试连接pm2，连接失败则报错退出命令进程
 * 连接成功后，根据命令行中是否输入--restart或-r来确定是启动应用还是重启应用
 * 如果是启动应用，那么尝试启动。启动失败则报错并退出进程，启动成功则断开pm2连接，这时，应用已经静默启动了
 * 如果是重启应用，那么先尝试重启。如果重启成功则断开pm2连接，启动失败则证明应用可能还没有启动，所以会自动尝试启动，也就是重复步骤2
 * @param configure  一个对象，包含配置信息，用于获取应用程序的配置。
 * @param args 一个包含命令行参数的对象，通过Arguments<Pm2Arguments>类型定义，其中Pm2Arguments是一个泛型类型，用于指定参数的结构。
 */
export const pm2Handler = async (configure: Configure, args: Arguments<Pm2Arguments>) => {
    // 获取应用程序名称: 通过configure.get方法获取应用程序的配置，并从中提取出应用程序的名称。
    const { name } = await configure.get<AppConfig>('app');
    // 调用getPm2Config函数，传入配置对象、选定的参数（args和watch）以及入口文件路径，获取PM2的配置。
    const pm2Config = await getPm2Config(configure, pick(args, ['args', 'watch']), args.entry);
    // 定义回调函数:
    // connectCallback: 连接PM2服务器的回调函数，如果连接失败，打印错误信息并退出进程。
    const connectCallback = (error?: any) => {
        if (!isNil(error)) {
            console.error(error);
            process.exit(2);
        }
    };
    // startCallback: 启动PM2进程的回调函数，如果启动失败，打印错误信息并退出进程。 如果成功，断开与PM2的连接。
    const startCallback = (error?: any) => {
        if (!isNil(error)) {
            console.error(error);
            exit(1);
        }
        console.log(`PM2 started successfully: ${name}`);
        pm2.disconnect();
        // 关闭当前进程，及主进程
        process.exit();
    };
    // restartCallback: 重启PM2进程的回调函数，如果重启失败，尝试重新启动进程；如果成功，断开与PM2的连接。
    const restartCallback = (error?: any) => {
        if (!isNil(error)) {
            pm2.start(pm2Config, (serr) => startCallback(serr));
        } else {
            console.log(`PM2 restarted successfully: ${name}`);
            pm2.disconnect();
            // 关闭当前进程，及主进程
            process.exit();
        }
    };

    // 连接PM2服务器并执行操作:
    pm2.connect((cerr) => {
        // 首先尝试连接PM2服务器，连接成功后根据args.restart参数决定是重启还是启动进程。
        connectCallback(cerr);
        args.restart
            ? pm2.restart(name, restartCallback) // 如果args.restart为true，则调用pm2.restart方法重启指定名称的进程。
            : pm2.start(pm2Config, (serr) => startCallback(serr)); // 如果args.restart为false，则调用pm2.start方法启动新的进程
    });
};