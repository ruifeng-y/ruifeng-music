// src/modules/database/commands/seed.handler.ts
import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/helpers';

import { runSeeder } from '../helpers';
import { DbOptions } from '../types';

import { SeederOptions } from './types';

/**
 * 命令处理器
 * 判断在当前数据库连接的配置中有自定义的填充入口类，没有则使用默认的SeedRunner类
   使用runSeeder运行填充
 * @param configure 
 * @param args 
 */
export const SeedHandler = async (configure: Configure, args: SeederOptions) => {
    const cname = args.connection ?? 'default';
    const { connections = [] }: DbOptions = await configure.get<DbOptions>('database');
    const dbConfig = connections.find(({ name }) => name === cname);
    if (isNil(dbConfig)) panic(`Database connection named ${cname} not exists!`);
    const runner = dbConfig.seedRunner;
    const spinner = ora('Start run seeder');
    try {
        spinner.start();
        await runSeeder(runner, args, spinner, configure, dbConfig);
        spinner.succeed(`\n 👍 ${chalk.greenBright.underline(`Finished Seeding`)}`);
        process.exit();
    } catch (error) {
        panic({ spinner, message: `Run seeder failed`, error });
    }
};