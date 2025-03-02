// src/modules/database/base/subcriber.ts
/**
 * 基础模型观察者
 * entity属性用于设置模型，是子类必须设置的一个抽象属性
 * constructor构造函数可以在子类中用super方法调用，以注入dataSource对象，并把当前的subscriber实例添加到当前的数据库连接dataSource中
 * getDataSource方法用于获取当前的数据库连接实例
 * getManage方法用于获取当前数据库连接的entityManage对象
 * getRepositoy方法用于获取一个模型（默认为this.entity属性）的自定义Repository的实例，如果没有传入自定义Repository类则直接获取该模型的默认Repository实例
 * listenTo用于监听模型
 * afterLoad方法用于在加载模型后对数据进行进一步处理，目前的作用是：判断当前模型是否为树形模型，如果是且没有设置depth虚拟字段，则把该字段的值设置成0
 * isUpdated方法用于判断判断某个字段是否被更新
 */
// import { ObjectLiteral, SelectQueryBuilder, Repository, ObjectType, DataSource, EventSubscriber, EntitySubscriberInterface, EntityTarget } from 'typeorm';
import { isNil } from 'lodash';
import { RepositoryType } from '../types';
import { getCustomRepository } from '../helpers';
import {
    EntitySubscriberInterface,
    EventSubscriber,
    ObjectLiteral,
    ObjectType,
    UpdateEvent,
    InsertEvent,
    SoftRemoveEvent,
    RemoveEvent,
    RecoverEvent,
    TransactionStartEvent,
    TransactionCommitEvent,
    TransactionRollbackEvent,
    EntityTarget,
    DataSource,
} from 'typeorm';

import { Optional } from '@nestjs/common';
import { Configure } from '@/modules/config/configure';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { app } from '@/modules/core/helpers';


type SubscriberEvent<E extends ObjectLiteral> =
    | InsertEvent<E>
    | UpdateEvent<E>
    | SoftRemoveEvent<E>
    | RemoveEvent<E>
    | RecoverEvent<E>
    | TransactionStartEvent
    | TransactionCommitEvent
    | TransactionRollbackEvent;



@EventSubscriber()
export abstract class BaseSubscriber<E extends ObjectLiteral>
    implements EntitySubscriberInterface<E>
{
    /**
     * 监听的模型
     */
    protected abstract entity: ObjectType<E>;

    /**
     * 构造函数
     * @param dataSource 数据连接池
     */
    // constructor(@@Optional() protected dataSource?: DataSource,
    //             @Optional() protected _configure?: Configure) 
    // {
    //     if (!isNil(this.dataSource)) this.dataSource.subscribers.push(this);
    // }

    constructor(
        @Optional() protected dataSource?: DataSource,
        @Optional() protected _configure?: Configure,
    ) {
        if (!isNil(this.dataSource)) this.dataSource.subscribers.push(this);
    }

    get configure(): Configure {
        return !isNil(this._configure)
            ? this._configure
            : app.container.get(Configure, { strict: false });
    }

    /**
     * 从app中获取容器
     */
    get container(): NestFastifyApplication {
        return app.container;
    }

    protected getDataSource(event: SubscriberEvent<E>) {
        return this.dataSource ?? event.connection;
    }

    protected getManage(event: SubscriberEvent<E>) {
        return this.dataSource ? this.dataSource.manager : event.manager;
    }

    listenTo() {
        return this.entity;
    }

    async afterLoad(entity: any) {
        // 是否启用树形
        if ('parent' in entity && isNil(entity.depth)) entity.depth = 0;
    }

    protected getRepositoy<
        C extends ClassType<T>,
        T extends RepositoryType<E>,
        A extends EntityTarget<ObjectLiteral>,
    >(event: SubscriberEvent<E>, repository?: C, entity?: A) {
        return isNil(repository)
            ? this.getDataSource(event).getRepository(entity ?? this.entity)
            : getCustomRepository<T, E>(this.getDataSource(event), repository);
    }

    /**
     * 判断某个字段是否被更新
     * @param cloumn
     * @param event
     */
    protected isUpdated(cloumn: keyof E, event: UpdateEvent<E>) {
        return !!event.updatedColumns.find((item) => item.propertyName === cloumn);
    }
}