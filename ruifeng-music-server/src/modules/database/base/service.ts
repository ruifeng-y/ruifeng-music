// src/modules/database/base/service.ts
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { isNil } from 'lodash';
import { In, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

// import { TreeChildrenResolve } from '@/modules/content/constants';
import { TreeChildrenResolve } from '../../database/constants';

import { SelectTrashMode } from '../constants';
import { paginate, treePaginate } from '../helpers';
import { PaginateOptions, PaginateReturn, QueryHook, ServiceListQueryOption } from '../types';

import { BaseRepository } from './repository';
import { BaseTreeRepository } from './tree.repository';
/**
 *  CRUD操作服务
 */
export abstract class BaseService<
E extends ObjectLiteral,
R extends BaseRepository<E> | BaseTreeRepository<E>,
P extends ServiceListQueryOption<E> = ServiceListQueryOption<E>,
> {
    /**
     * 服务默认存储类
     */
    protected repository: R;

    /**
     * 是否开启软删除功能
     */
    protected enableTrash = false;

    constructor(repository: R) {
        this.repository = repository;
        if (
            !(
                this.repository instanceof BaseRepository ||
                this.repository instanceof BaseTreeRepository
            )
        ) {
            throw new Error(
                'Repository must instance of BaseRepository or BaseTreeRepository in DataService!',
            );
        }
    }

    /**
     * 获取查询单个项目的QueryBuilder
     * buildItemQB方法用于构建查询单条数据详情的querybuilder，接受3个参数，分别为待查询数据的ID，qb实例以及操作qb的回调函数，代码如下:
     * @param id 查询数据的ID
     * @param qb querybuilder实例
     * @param callback 查询回调
     */
    protected async buildItemQB(id: string, qb: SelectQueryBuilder<E>, callback?: QueryHook<E>) {
        qb.where(`${this.repository.qbName}.id = :id`, { id });
        if (callback) return callback(qb);
        return qb;
    }

    /**
     * 获取查询数据列表的 QueryBuilder
     * buildListQB方法用于构建查询普通（非树形）结构的数据列表的queryBuilder，其逻辑为：如果查询时，有传入trashed参数，且当
     * 该参数是all或者only时同时会查询回收站中的数据（前提是开启this.enableTrash）,如果trashed是only，则只查询回收站中的
     * 数据。另外如果有回调查询函数则返回回调执行后的qb，否则直接返回qb，代码如下:
     * @param qb querybuilder实例
     * @param options 查询选项
     * @param callback 查询回调
     */
    protected async buildListQB(qb: SelectQueryBuilder<E>, options?: P, callback?: QueryHook<E>) {
        const { trashed } = options ?? {};
        const queryName = this.repository.qbName;
        // 是否查询回收站
        if (
            this.enableTrash &&
            (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY)
        ) {
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) {
                qb.where(`${queryName}.deletedAt is not null`);
            }
        }
        if (callback) return callback(qb);
        return qb;
    }

    /**
     * 获取数据列表
     * list方法用于查询数据列表，通过this.repository属性所属类的基类类型来判断查询的模型是树形还是普通模型。在查询普通（非树
     * 形）结构的数据列表时使用buildListQB来构建queryBuilder并使用getMany来获取数据，在查询树形数据列表时，先计算出
     * withTrashed和onlyTrashed，并合并其它选项传入findTrees来获取数据树，然后再使用toFlatTrees来生成扁平化数据
     * @param params 查询参数
     * @param callback 回调查询
     */
    async list(options?: P, callback?: QueryHook<E>): Promise<E[]> {
        const { trashed: isTrashed = false } = options ?? {};
        const trashed = isTrashed || SelectTrashMode.NONE;
        if (this.repository instanceof BaseTreeRepository) {
            const withTrashed =
                this.enableTrash &&
                (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY);
            const onlyTrashed = this.enableTrash && trashed === SelectTrashMode.ONLY;
            const tree = await this.repository.findTrees({
                ...options,
                withTrashed,
                onlyTrashed,
            });
            return this.repository.toFlatTrees(tree);
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
        return qb.getMany();
    }

    /**
     * 获取分页数据
     * paginate方法用于查询分页后的数据列表，接受两个参数：options为分页选项，callback为querybuilder实例的回调函数。其执行逻辑为：
     * 如果this.repository属性所属类的基类是BaseTreeRepository，则先使用list查询出打平后的数据，再使用treePaginate函数对数据进行手动分页；
     * 如果基类是BaseRepository，则先使用buildListQB构建数据列表查询的queryBuilder实例，再返回使用paginate函数进行分页后的数据
     * @param options 分页选项
     * @param callback 回调查询
     */
    async paginate(
        options?: PaginateOptions & P,
        callback?: QueryHook<E>,
    ): Promise<PaginateReturn<E>> {
        const queryOptions = (options ?? {}) as P;
        if (this.repository instanceof BaseTreeRepository) {
            const data = await this.list(queryOptions, callback);
            return treePaginate(options, data) as PaginateReturn<E>;
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), queryOptions, callback);
        return paginate(qb, options);
    }

     /**
     * 获取数据详情
     * 单条数据查询 detail用于根据传入的ID来查询一条数据的详情。首先使用buildItemQB构建查询的queryBuilder实例，然后通过该qb的getOne方法来查询出数据并返回
     * @param id
     * @param trashed 查询时是否包含已软删除的数据
     * @param callback 回调查询
     */
     async detail(id: string, callback?: QueryHook<E>): Promise<E> {
        const qb = await this.buildItemQB(id, this.repository.buildBaseQB(), callback);
        const item = await qb.getOne();
        if (!item) throw new NotFoundException(`${this.repository.qbName} ${id} not exists!`);
        return item;
    }


    /**
     * 批量删除数据
     * delete方法用于根据传入的ID列表来删除数据。
     * 1、判断删除操作针对的模型是否为树形模型，对应不同的操作
     * 如果是树形模型的话，根据自定义的repository的childrenResolve属性先对其子孙数据进行处理（提升到顶级节点/提升一级/直接删除），其中提升到顶级节点/直接删除由TreeParent的onDelete选项自动操作
     * 如果不是属性模型则直接查询出要删除的数据
     * 2、根据是否开启软删除进行不同操作
     * 如果开启软删除且本次删除为软删除的情况下，对上面查询出的待删除中的数据中已经处于回收站状态的数据直接删除掉，而对于不处于回收站的数据则使用软删除放入回收站
     * 如果不是软删除，那么直接使用remove方法对数据进行硬删除即可
     * 3、最后返回软删除或硬删除之后的数据列表
     * @param data 需要删除的id列表
     * @param trash 是否只扔到回收站,如果为true则软删除
     */
    async delete(ids: string[], trash?: boolean) {
        let items: E[] = [];
        if (this.repository instanceof BaseTreeRepository) {
            items = await this.repository.find({
                where: { id: In(ids) as any },
                withDeleted: this.enableTrash ? true : undefined,
                relations: ['parent', 'children'],
            });
            if (this.repository.childrenResolve === TreeChildrenResolve.UP) {
                for (const item of items) {
                    if (isNil(item.children) || item.children.length <= 0) continue;
                    const nchildren = [...item.children].map((c) => {
                        c.parent = item.parent;
                        return item;
                    });
                    await this.repository.save(nchildren);
                }
            }
        } else {
            items = await this.repository.find({
                where: { id: In(ids) as any },
                withDeleted: this.enableTrash ? true : undefined,
            });
        }
        if (this.enableTrash && trash) {
            const directs = items.filter((item) => !isNil(item.deletedAt));
            const softs = items.filter((item) => isNil(item.deletedAt));
            return [
                ...(await this.repository.remove(directs)),
                ...(await this.repository.softRemove(softs)),
            ];
        }
        return this.repository.remove(items);
    }

    /**
     * 批量恢复回收站中的数据
     * restore方法用于恢复回收站中的数据
     * 1、如果没有开启enableTrash则直接抛出异常
     * 2、查出待恢复的数据
     * 3、过滤掉非处于回收站的数据
     * 4、把处于回收站的数据恢复出来
     * 5、使用buildListQB方法把恢复后的数据查询出来并返回
     * @param data 需要恢复的id列表
     */
    async restore(ids: string[]) {
        if (!this.enableTrash) {
            throw new ForbiddenException(
                `Can not to retore ${this.repository.qbName},because trash not enabled!`,
            );
        }
        const items = await this.repository.find({
            where: { id: In(ids) as any },
            withDeleted: true,
        });
        const trasheds = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trasheds.length < 1) return [];
        await this.repository.restore(trasheds);
        const qb = await this.buildListQB(
            this.repository.buildBaseQB(),
            undefined,
            async (builder) => builder.andWhereInIds(trasheds),
        );
        return qb.getMany();
    }

    /**
     * 创建数据,如果子类没有实现则抛出404
     * @param data 请求数据
     * @param others 其它参数
     */
    create(data: any, ...others: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to create ${this.repository.qbName}!`);
    }

    /**
     * 更新数据,如果子类没有实现则抛出404
     * @param data 请求数据
     * @param others 其它参数
     */
    update(data: any, ...others: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to update ${this.repository.qbName}!`);
    }
}