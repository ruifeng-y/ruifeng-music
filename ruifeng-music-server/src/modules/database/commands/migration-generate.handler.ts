// src/modules/database/commands/migration-generate.handler.ts
import chalk from 'chalk';
import { isNil, pick } from 'lodash';
import ora from 'ora';
import { DataSource, DataSourceOptions } from 'typeorm';

import { Arguments } from 'yargs';

import { Configure } from '@/modules/config/configure';
import { getRandomCharString, panic } from '@/modules/core/helpers';

import { DbConfig } from '../types';

import { MigrationRunHandler } from './migration-run.handler';
import { TypeormMigrationGenerate } from './typeorm-migration-generate';
import { MigrationGenerateArguments } from './types';
/**
 * 生成迁移处理器
 * 生成迁移需要与运行迁移相结合，所以目前缺少运行迁移的方法导致报错先不用管，具体步骤如下

 * 在生成迁移之前，先运行一次迁移以便把前面没有运行的迁移先同步到数据库，这是为了防止重复生成迁移文件
 * 在指定目录中生成迁移文件
 * 如果是run参数为true的话，再次运行迁移以便直接把生成的最新迁移同步到数据库
 * @param configure
 * @param args
 */
export const MigrationGenerateHandler = async (
    configure: Configure,
    args: Arguments<MigrationGenerateArguments>,
) => {
    await MigrationRunHandler(configure, { connection: args.connection } as any);
    console.log();
    const spinner = ora('Start to generate migration');
    const cname = args.connection ?? 'default';
    try {
        spinner.start();
        console.log();
        const { connections = [] }: DbConfig = await configure.get<DbConfig>('database');
        const dbConfig = connections.find(({ name }) => name === cname);
        if (isNil(dbConfig)) panic(`Database connection named ${cname} not exists!`);
        console.log();
        const runner = new TypeormMigrationGenerate();
        const dataSource = new DataSource({ ...dbConfig } as DataSourceOptions);
        console.log();
        await runner.handler({
            name: args.name ?? getRandomCharString(6),
            dir: dbConfig.paths.migration,
            dataSource,
            ...pick(args, ['pretty', 'outputJs', 'dryrun', 'check']),
        });
        if (dataSource.isInitialized) await dataSource.destroy();
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished generate migration'));
        if (args.run) {
            console.log();
            await MigrationRunHandler(configure, { connection: args.connection } as any);
        }
    } catch (error) {
        panic({ spinner, message: 'Generate migration failed!', error });
    }
};