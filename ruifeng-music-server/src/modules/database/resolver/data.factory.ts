// src/modules/database/resolver/data.factory.ts
import { isPromise } from 'util/types';

import { isNil } from 'lodash';
import { EntityManager, EntityTarget } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { panic } from '@/modules/core/helpers';

import { DbFactoryHandler } from '../commands/types';
import { FactoryOverride } from '../../database/types';

export class DataFactory<Entity, Settings> {
    private mapFunction!: (entity: Entity) => Promise<Entity>;

    constructor(
        public name: string,
        public configure: Configure,
        public entity: EntityTarget<Entity>,
        protected em: EntityManager,
        protected factory: DbFactoryHandler<Entity, Settings>,
        protected settings: Settings,
    ) {}

    /**
     * 默认的执行函数是定义后在database的配置里设置了的，但有时我们可以不想使用默认的模型绑定的工厂函数，可以通过map方法为该模型临时换绑一个工厂函数
     * @param mapFunction 
     * @returns 
     */
    map(mapFunction: (entity: Entity) => Promise<Entity>): DataFactory<Entity, Settings> {
        this.mapFunction = mapFunction;
        return this;
    }

    /**
     * make方法用于临时创建一批模拟数据以备后续使用，但不是马上就存储到数据库
     * @param overrideParams 
     * @returns 
     */
    async make(overrideParams: FactoryOverride<Entity> = {}): Promise<Entity> {
        if (this.factory) {
            let entity: Entity = await this.resolveEntity(
                await this.factory(this.configure, this.settings),
            );
            if (this.mapFunction) entity = await this.mapFunction(entity);
            for (const key in overrideParams) {
                if (overrideParams[key]) {
                    entity[key] = overrideParams[key]!;
                }
            }
            return entity;
        }
        throw new Error('Could not found entity');
    }

    /**
     * create方法非常简单，就是先调用make方法生成模型对象，再通过entityManger获取该对象默认的Repository对象，
     * 然后使用save方法保存该对象。 于此同时，我们还可以通过传入一个existsCheck来判断数据库中是否存在当前模型实例的某个字段值的数据，如果不存在才创建！
     * @param overrideParams 
     * @param existsCheck 
     * @returns 
     */
    async create(
        overrideParams: FactoryOverride<Entity> = {},
        existsCheck?: string,
    ): Promise<Entity> {
        try {
            const entity = await this.make(overrideParams);
            if (!isNil(existsCheck)) {
                const repo = this.em.getRepository(this.entity);
                const value = (entity as any)[existsCheck];
                if (!isNil(value)) {
                    const item = await repo.findOneBy({ [existsCheck]: value } as any);
                    if (isNil(item)) return await this.em.save(entity);
                    return item;
                }
            }
            return await this.em.save(entity);
        } catch (error) {
            const message = 'Could not save entity';
            panic({ message, error });
            throw new Error(message);
        }
    }

    /**
     * 通过makeMany与createMany方法可以遍历地模拟及创建多条数据，数据的数量可通过amount参数来指定
     * @param amount 
     * @param overrideParams 
     * @returns 
     */
    async makeMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.make(overrideParams);
        }
        return list;
    }

    async createMany(
        amount: number,
        overrideParams: FactoryOverride<Entity> = {},
        existsCheck?: string,
    ): Promise<Entity[]> {
        const list = [];
        for (let index = 0; index < amount; index += 1) {
            list[index] = await this.create(overrideParams, existsCheck);
        }
        return list;
    }

    private async resolveEntity(entity: Entity): Promise<Entity> {
        for (const attribute in entity) {
            if (entity[attribute]) {
                if (isPromise(entity[attribute])) {
                    entity[attribute] = await Promise.resolve(entity[attribute]);
                }

                if (typeof entity[attribute] === 'object' && !(entity[attribute] instanceof Date)) {
                    const subEntityFactory = entity[attribute];
                    try {
                        if (typeof (subEntityFactory as any).make === 'function') {
                            entity[attribute] = await (subEntityFactory as any).make();
                        }
                    } catch (error) {
                        const message = `Could not make ${(subEntityFactory as any).name}`;
                        panic({ message, error });
                        throw new Error(message);
                    }
                }
            }
        }
        return entity;
    }
}