// src/modules/database/resolver/seed.runner.ts
import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { Type } from '@nestjs/common';
import { ensureFileSync, readFileSync } from 'fs-extra';

import { get, isNil, set } from 'lodash';
import { DataSource, EntityManager } from 'typeorm';

import YAML from 'yaml';

import { BaseSeeder } from '../base/seeder';
import { DbFactory } from '../commands/types';
/**
 * 默认的Seed Runner
 *  入口类一般是唯一的，用于调用其它编写具体逻辑的Seeder类来进行数据填充，其逻辑如下
    获取需要运行的数据连接下的所有Seeder类
    首先读取项目的外层目录下的seed-lock.yml文件内容（如果不存在的话则创建一个）
    接着读取该yaml文件的内容到一个对象并把它赋值给locked
    该对象的结构为{连接名: [已经执行过的seeder类名]}
    获取当前连接下已经执行过的seeder类并赋值给lockNames
    判断当前环境是否忽略锁定（是否有-i或--ignoreLock参数）
    如果是，则从当前待执行的seeder类数组中过滤掉lockNames中的seeder类并赋值给seeders数组变量，防止这些seeder类被重复执行
    遍历执行seeders数组中的seeder类
    全部执行完毕后把seeders数组中的类添加到locked变量
    最后把新的locked写入seed-lock.yml
 */
export class SeedRunner extends BaseSeeder {
    /**
     * 运行一个连接的填充类
     * @param _dataSource
     * @param _em
     */
    async run(_factory: DbFactory, _dataSource: DataSource, _em: EntityManager): Promise<any> {
        let seeders: Type<any>[] = ((await this.getDbConfig()) as any).seeders ?? [];
        const seedLockFile = resolve(__dirname, '../../../..', 'seed-lock.yml');
        ensureFileSync(seedLockFile);
        const yml = YAML.parse(readFileSync(seedLockFile, 'utf8'));
        const locked = isNil(yml) ? {} : yml;
        const lockNames = get<string[]>(locked, this.connection, []);
        if (!this.ignoreLock) {
            seeders = seeders.filter((s) => !lockNames.includes(s.name));
        }
        for (const seeder of seeders) {
            await this.call(seeder);
        }
        set(
            locked,
            this.connection,
            !this.ignoreLock
                ? [...lockNames, ...seeders.map((s) => s.name)]
                : seeders.map((s) => s.name),
        );
        writeFileSync(seedLockFile, JSON.stringify(locked, null, 4));
    }
}