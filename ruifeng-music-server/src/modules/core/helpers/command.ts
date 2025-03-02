// src/modules/core/helpers/command.ts
import { App, CommandCollection, PanicOption } from '../types';
import yargs, { Arguments, CommandModule } from 'yargs';

import chalk from 'chalk';
import * as coreCommands from '../commands';
import { hideBin } from 'yargs/helpers';
import { isNil } from 'lodash';

// import * as coreCommands from '../commands';

/**
 * 创建命令
 * 1、根据传入的命令构建函数生成函数获取命令构造器列表
 * 2、执行所有的命令构造器函数，并为每个函数传入app参数，获取所有的yargs命令模块
 * 3、遍历这些命令模块，改造执行器函数。首先关闭container实例，然后执行命令执行器，最后判断如果是瞬时命令就退出进程
 * 
 * 用途
 * 这个函数的用途是在一个应用程序中动态创建和管理命令模块。它允许开发者通过工厂函数动态添加自定义命令，同时保留核心命令的功能。
 * 这对于构建可扩展的应用程序非常有用，特别是当命令集可能随时间变化时。
 * @param factory
 * @param app
 */
export async function createCommands(
    factory: () => CommandCollection,
    app: Required<App>,
): Promise<CommandModule<any, any>[]> {
    
    // 合并命令集合：首先，通过调用factory函数获取命令集合，并将其与coreCommands（假设是预先定义的核心命令集合）合并。这里使用了扩展运算符...来合并两个数组。
    const collection: CommandCollection = [...factory(), ...Object.values(coreCommands)];
    // 异步处理命令：使用Promise.all对合并后的命令集合中的每个命令进行异步处理。每个命令都通过调用command(app)来处理，并返回一个Promise。
    const commands = await Promise.all(collection.map(async (command) => command(app)));
    // 返回处理后的命令模块：对每个处理后的命令，创建一个新的命令模块对象，其中包含命令的属性和修改后的handler函数。
    // handler函数在执行命令后，会关闭应用程序的容器，然后执行命令的处理器。如果命令是即时执行的，则退出进程。
    // 遍历commands数组，对每个command进行处理
    return commands.map((command) => ({
        // 将command对象展开
        ...command,
        // 定义handler函数，接收args参数
        handler: async (args: Arguments<RecordAny>) => {
            // 关闭app容器
            await app.container.close();
            // 执行command的handler函数
            await command.handler(args);
            // 如果command的instant属性为true，则退出进程
            if (command.instant) process.exit();
        },
    }));
}

/**
 * 构建yargs cli
 * @param creator
 */
// 导出一个异步函数buildCli，参数为一个返回Promise<App>的函数creator
export async function buildCli(creator: () => Promise<App>) {
    // 调用creator函数，获取App实例
    const app = await creator();
    // 创建一个yargs实例，并隐藏process.argv中的bin参数
    const bin = yargs(hideBin(process.argv));
    // 遍历App实例中的commands，将每个command添加到bin实例中
    app.commands.forEach((command) => bin.command(command));
    // 设置bin实例的用法，脚本名称，命令行参数要求，错误处理，严格模式，版本和帮助的别名，并解析命令行参数
    bin.usage('Usage: $0 <command> [args]')
        .scriptName('cli')
        .demandCommand(1, '')
        .fail((msg, err, y) => {
            // 如果没有错误信息，则显示帮助信息并退出
            if (!msg && !err) {
                bin.showHelp();
                process.exit();
            }
            // 如果有错误信息，则打印错误信息并退出
            if (msg) console.error(chalk.red(msg));
            if (err) console.error(chalk.red(err.message));
            process.exit();
        })
        .strict()
        .alias('v', 'version')
        .help('h')
        .alias('h', 'help')
        .parse();
}
/**
 * 输出命令行错误消息
 * @param option
 */
// 导出一个异步函数panic，接收一个PanicOption类型的参数option
export async function panic(option: PanicOption | string) {
    // 打印空行
    console.log();
    // 如果option是字符串类型
    if (typeof option === 'string') {
        // 打印红色错误信息
        console.log(chalk.red(`\n❌ ${option}`));
        // 退出程序
        process.exit(1);
    }
    // 解构赋值，获取option中的error、message、spinner、exit属性
    const { error, message, spinner, exit = true } = option;
    // 如果error不为空
    if (!isNil(error)) {
        // 如果spinner不为空，则打印红色错误信息
        !isNil(spinner) ? spinner.fail(chalk.red(error)) : console.log(chalk.red(error));
    } else {
        // 如果spinner不为空，则打印红色错误信息
        !isNil(spinner)
            ? spinner.succeed(chalk.red(`\n❌ ${message}`))
            : console.log(chalk.red(`\n❌ ${message}`));
    }
    // 如果exit为true，则退出程序
    if (exit) process.exit(1);
}