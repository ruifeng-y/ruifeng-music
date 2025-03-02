// src/modules/database/commands/migration-create.handler.ts
import chalk from 'chalk';
import { isNil } from 'lodash';
import ora from 'ora';
import { Arguments } from 'yargs';

import { Configure } from '@/modules/config/configure';

import { panic } from '@/modules/core/helpers';

import { DbOptions, TypeormOption } from '../types';

import { TypeormMigrationCreate } from './typeorm-migration-create';
import { MigrationCreateArguments } from './types';

/**
 * 创建迁移处理器
 * @param configure
 * @param args
 */
export const MigrationCreateHandler = async (
    configure: Configure,
    args: Arguments<MigrationCreateArguments>,
) => {
    const spinner = ora('Start to create migration').start();
    const cname = args.connection ?? 'default';
    try {
        const { connections = [] } = await configure.get<DbOptions>('database');
        const dbConfig: TypeormOption = connections.find(({ name }) => name === cname);
        if (isNil(dbConfig)) panic(`Database connection named ${cname} not exists!`);
        const runner = new TypeormMigrationCreate();
        console.log();
        runner.handler({
            name: cname,
            dir: dbConfig.paths.migration,
        });
        spinner.succeed(chalk.greenBright.underline('\n 👍 Finished create migration'));
    } catch (error) {
        panic({ spinner, message: 'Create migration failed!', error });
    }
};