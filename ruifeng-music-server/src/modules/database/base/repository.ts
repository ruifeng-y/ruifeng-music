// src/modules/database/base/repository.ts
import { OrderType } from '../constants';
import { Repository, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { OrderQueryType } from '../types';
import { getOrderByQuery } from '../helpers';
import { isNil } from 'lodash';

export abstract class BaseRepository<E extends ObjectLiteral> extends Repository<E> {
    /**
     * 构建查询时默认的模型对应的查询名称
     * _qbName与get qbName用于在构建queryBuilder时指定和获取默认的queryname，比如
     * this.createQueryBuilder(this.qbName)，其中_qbName为抽象属性，所以必须在子类中实现
     */
    protected abstract _qbName: string;

    /**
     * 返回查询器名称
     */
    get qbName() {
        return this._qbName;
    }

    /**
     * 构建基础查询器
     * buildBaseQB用于构建一个默认的queryBuilder，可以通过子类重载该方法以构建一个自定义的默认的queryBuilder生成器
     */
    buildBaseQB(): SelectQueryBuilder<E> {
        return this.createQueryBuilder(this.qbName);
    }

    /**
     * 默认排序规则，可以通过每个方法的orderBy选项进行覆盖
     */
    protected orderBy?: string | { name: string; order: `${OrderType}` };

    /**
     * 生成排序的QueryBuilder
     * @param qb
     * @param orderBy
     */
    addOrderByQuery(qb: SelectQueryBuilder<E>, orderBy?: OrderQueryType) {
        const orderByQuery = orderBy ?? this.orderBy;
        return !isNil(orderByQuery) ? getOrderByQuery(qb, this.qbName, orderByQuery) : qb;
    }
}