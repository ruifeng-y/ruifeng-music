// src/modules/database/commands/seed.command.ts
import { Arguments } from 'yargs';

import { CommandItem } from '@/modules/core/types';

import { SeedHandler } from './seed.handler';
import { SeederArguments } from './types';

/**
 * 
 * clear: 是否根据填充类中定义的truncated属性清除数据表（生产环境下不可用）
    connection: 需要运行填充的数据库连接名（默认default）
    transaction: 是否在事务模式下运行
    ignorelock: 是否忽略锁定
 * @param param0 
 * @returns 
 */
export const SeedCommand: CommandItem<any, SeederArguments> = async ({ configure }) => ({
    command: ['db:seed', 'dbs'],
    describe: 'Runs all seeds data.',
    builder: {
        clear: {
            type: 'boolean',
            alias: 'r',
            describe: 'Clear which tables will truncated specified by seeder class.',
            default: true,
        },
        connection: {
            type: 'string',
            alias: 'c',
            describe: 'Connection name of typeorm to connect database.',
        },
        transaction: {
            type: 'boolean',
            alias: 't',
            describe: 'If is seed data in transaction,default is true',
            default: true,
        },
        ignorelock: {
            type: 'boolean',
            alias: 'i',
            describe: 'Ignore seed lock and reset all seeds, not do it in production',
            default: false,
        },
    } as const,

    handler: async (args: Arguments<SeederArguments>) => SeedHandler(configure, args),
});