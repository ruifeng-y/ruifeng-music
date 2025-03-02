// src/modules/content/repositories/comment.repository.ts
import { isNil, unset } from 'lodash';
import { CommentEntity } from '@/modules/content/entities/comment.entity';
import { CustomRepository } from '@/modules/database/decorators/repository.decorator';
import { SelectQueryBuilder,FindTreeOptions, FindOptionsUtils } from 'typeorm';
import { BaseTreeRepository } from '../../database/base/tree.repository'
import { QueryParams } from '../../database/types';

type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};

@CustomRepository(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    protected _qbName = 'comment';

    protected orderBy = 'createdAt';

    /**
     * 构建基础查询器
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>): SelectQueryBuilder<CommentEntity> {
        // return qb
        //     .leftJoinAndSelect(`comment.parent`, 'parent')
        //     .leftJoinAndSelect(`comment.post`, 'post')
        //     .orderBy('comment.createdAt', 'DESC');

        return super
            .buildBaseQB(qb)
            // 添加上作者查询
            .leftJoinAndSelect(`${this.qbName}.author`, 'author')
            .leftJoinAndSelect(`${this.qbName}.post`, 'post');
    }

    // /**
    //  * 查询树
    //  * @param options
    //  */
    // async findTrees(options: FindCommentTreeOptions = {}) {
    //     options.relations = ['parent', 'children'];
    //     const roots = await this.findRoots(options);
    //     await Promise.all(roots.map((root) => this.findDescendantsTree(root, options)));
    //     return roots;
    // }

    async findTrees(
        options: FindTreeOptions & QueryParams<CommentEntity> & { post?: string } = {},
    ): Promise<CommentEntity[]> {
        return super.findTrees({
            ...options,
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });
    }

    /**
     * 查询顶级评论
     * @param options
     */
    findRoots(options: FindCommentTreeOptions = {}) {
        const { addQuery, ...rest } = options;
        const escapeAlias = (alias: string) => this.manager.connection.driver.escape(alias);
        const escapeColumn = (column: string) => this.manager.connection.driver.escape(column);

        const joinColumn = this.metadata.treeParentRelation!.joinColumns[0];
        const parentPropertyName = joinColumn.givenDatabaseName || joinColumn.databaseName;

        let qb = this.buildBaseQB(this.createQueryBuilder('comment'));
        FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, rest);
        qb.where(`${escapeAlias('comment')}.${escapeColumn(parentPropertyName)} IS NULL`);
        qb = addQuery ? addQuery(qb) : qb;
        return qb.getMany();
    }

    /**
     * 创建后代查询器
     * @param closureTableAlias
     * @param entity
     * @param options
     */
    createDtsQueryBuilder(
        closureTableAlias: string,
        entity: CommentEntity,
        options: FindCommentTreeOptions = {},
    ): SelectQueryBuilder<CommentEntity> {
        const { addQuery } = options;
        const qb = this.buildBaseQB(
            super.createDescendantsQueryBuilder('comment', closureTableAlias, entity),
        );
        return addQuery ? addQuery(qb) : qb;
    }

    /**
     * 查询后代树
     * @param entity
     * @param options
     */
    // async findDescendantsTree(
    //     entity: CommentEntity,
    //     options: FindCommentTreeOptions = {},
    // ): Promise<CommentEntity> {
    //     const qb: SelectQueryBuilder<CommentEntity> = this.createDtsQueryBuilder(
    //         'treeClosure',
    //         entity,
    //         options,
    //     );
    //     FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, pick(options, ['relations', 'depth']));
    //     const entities = await qb.getRawAndEntities();
    //     const relationMaps = TreeRepositoryUtils.createRelationMaps(
    //         this.manager,
    //         this.metadata,
    //         'comment',
    //         entities.raw,
    //     );
    //     TreeRepositoryUtils.buildChildrenEntityTree(
    //         this.metadata,
    //         entity,
    //         entities.entities,
    //         relationMaps,
    //         {
    //             depth: -1,
    //             ...pick(options, ['relations']),
    //         },
    //     );

    //     return entity;
    // }
    // async findDescendantsTree(
    //     entity: CommentEntity, options?: FindTreeOptions & QueryParams<CommentEntity>
    // ): Promise<CommentEntity[]> {
    //     return super.findDescendantsTree({...entity,options});
    // }

    /**
     * 打平并展开树
     * @param trees
     * @param depth
     */
    async toFlatTrees(trees: CommentEntity[], depth = 0) {
        const data: Omit<CommentEntity, 'children'>[] = [];
        for (const item of trees) {
            item.depth = depth;
            const { children } = item;
            unset(item, 'children');
            data.push(item);
            data.push(...(await this.toFlatTrees(children, depth + 1)));
        }
        return data as CommentEntity[];
    }
}