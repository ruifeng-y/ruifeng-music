// src/modules/content/services/post.service.ts
import {
    Injectable,
} from '@nestjs/common';
import { isNil, isFunction, omit, isArray, pick } from 'lodash';
import { CategoryRepository } from '../repositories/category.repository';
import { PostRepository } from '../repositories/post.repository';
import { TagRepository } from '../repositories/tag.repository';
import { PostEntity } from '../../content/entities/post.entity';
import { QueryHook } from '../../database/types';
import { SelectQueryBuilder,In, Not, IsNull, EntityNotFoundError } from 'typeorm';
import { PostOrderType } from '../../content/constants';
import { paginate } from '@/modules/database/helpers';
import { CreatePostDto, UpdatePostDto, QueryPostDto  } from '@/modules/content/dtos/post.dto';
import { CategoryService } from '@/modules/content/services/category.service';
import { SelectTrashMode } from '@/modules/database/constants';
// import { SearchType } from '@/modules/content/types';
import { SearchService } from './search.service';
import { BaseService } from '../../database/base/service';
import type { SearchType } from '../types';
import { UserEntity } from '@/modules/user/entities';
import { UserRepository } from '@/modules/user/repositories';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

/**
 * 文章数据操作
 */
@Injectable()
export class PostService extends BaseService<PostEntity, PostRepository, FindParams>{
    protected enableTrash = true;

    constructor(
        protected repository: PostRepository,
        protected categoryRepository: CategoryRepository,
        protected categoryService: CategoryService,
        protected tagRepository: TagRepository,
        protected userRepository: UserRepository,
        protected searchService?: SearchService,
        protected search_type: SearchType = 'mysql',
    ) {
        super(repository)
    }

    // /**
    //  * 获取分页数据
    //  * @param options 分页选项
    //  * @param callback 添加额外的查询
    //  */
    // async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
    //     if (!isNil(this.searchService) && !isNil(options.search) && this.search_type === 'meilli') {
    //         return this.searchService.search(
    //             options.search,
    //             pick(options, ['trashed', 'page', 'limit']),
    //         );
    //     }
    //     const qb = await this.buildListQuery(this.repository.buildBaseQB(), options, callback);
    //     return paginate(qb, options);
    // }

    /**
     * 获取分页数据
     * @param options 分页选项
     * @param callback 添加额外的查询
     */
    async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
        if (!isNil(this.searchService) && !isNil(options.search) && this.search_type === 'meilli') {
            return this.searchService.search(
                options.search,
                // 从options对象中选取trashed、page、limit、isPublished属性
                pick(options, ['trashed', 'page', 'limit', 'isPublished']),
            ) as any;
        }
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    /**
     * 查询单篇文章
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string, callback?: QueryHook<PostEntity>) {
        let qb = this.repository.buildBaseQB();
        qb.where(`post.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
        return item;
    }

    // /**
    //  * 创建文章
    //  * @param data
    //  */
    // async create(data: CreatePostDto) {
    //     let publishedAt: Date | null;
    //     if (!isNil(data.publish)) {
    //         publishedAt = data.publish ? new Date() : null;
    //     }
    //     const createPostDto = {
    //         ...omit(data, ['publish']),
    //         // 文章所属的分类
    //         category: !isNil(data.category)
    //             ? await this.categoryRepository.findOneOrFail({ where: { id: data.category } })
    //             : null,
    //         // 文章关联的标签
    //         tags: isArray(data.tags)
    //             ? await this.tagRepository.findBy({
    //                   id: In(data.tags),
    //               })
    //             : [],
    //         publishedAt,
    //     };
    //     const item = await this.repository.save(createPostDto);
    //     const result = await this.detail(item.id);
    //     if (!isNil(this.searchService)) await this.searchService.create(result);
    //     return this.detail(item.id);
    // }

    /**
     * 创建文章
     * @param data
     */
    async create(data: CreatePostDto, author: ClassToPlain<UserEntity>) {
        let publishedAt: Date | null;
        if (!isNil(data.publish)) {
            publishedAt = data.publish ? new Date() : null;
        }
        const authorId = isNil((data as CreatePostDto).author)
        ? author.id
        : (data as CreatePostDto).author;
        const createPostDto = {
            ...omit(data, ['publish', 'author']),
            // 文章作者
            author: await this.userRepository.findOneByOrFail({ id: authorId }),
            // author: await this.userRepository.findOneByOrFail({ id: author.id }),
            // 文章所属的分类
            category: !isNil(data.category)
                ? await this.categoryRepository.findOneOrFail({ where: { id: data.category } })
                : null,
            // 文章关联的标签
            tags: isArray(data.tags)
                ? await this.tagRepository.findBy({
                      id: In(data.tags),
                  })
                : [],
            publishedAt,
        };
        const item = await this.repository.save(createPostDto);
        const result = await this.detail(item.id);
        if (!isNil(this.searchService)) await this.searchService.create(result);
        return result;
    }

    // /**
    //  * 更新文章
    //  * @param data
    //  */
    // async update(data: UpdatePostDto) {
    //     let publishedAt: Date | null;
    //     if (!isNil(data.publish)) {
    //         publishedAt = data.publish ? new Date() : null;
    //     }
    //     const post = await this.detail(data.id);
    //     if (data.category !== undefined) {
    //         // 更新分类
    //         const category = isNil(data.category)
    //             ? null
    //             : await this.categoryRepository.findOneByOrFail({ id: data.category });
    //         post.category = category;
    //         this.repository.save(post, { reload: true });
    //     }
    //     if (isArray(data.tags)) {
    //         // 更新文章关联标签
    //         await this.repository
    //             .createQueryBuilder('post')
    //             .relation(PostEntity, 'tags')
    //             .of(post)
    //             .addAndRemove(data.tags, post.tags ?? []);
    //     }
    //     // await this.repository.update(data.id, {
    //     //     ...omit(data, ['id', 'tags', 'category', 'publish']),
    //     //     publishedAt,
    //     // });
    //     // return this.detail(data.id);

    //     await this.repository.update(data.id, omit(data, ['id', 'tags', 'category']));
    //     const result = await this.detail(data.id);
    //     if (!isNil(this.searchService)) await this.searchService.update([result]);
    //     return result;
    // }


    /**
     * 更新文章
     * @param data
     */
    async update(data: UpdatePostDto) {
        let publishedAt: Date | null;
        if (!isNil(data.publish)) {
            publishedAt = data.publish ? new Date() : null;
        }
        const post = await this.detail(data.id);
        if (!isNil((data as UpdatePostDto).author)) {
            const author = await this.userRepository.findOneByOrFail({
                id: (data as UpdatePostDto).author,
            });
            post.author = author;
            await this.repository.save(author, { reload: true });
        }
        if (data.category !== undefined) {
            // 更新分类
            const category = isNil(data.category)
                ? null
                : await this.categoryRepository.findOneByOrFail({ id: data.category });
            post.category = category;
            this.repository.save(post, { reload: true });
        }
        if (isArray(data.tags)) {
            // 更新文章关联标签
            await this.repository
                .createQueryBuilder('post')
                // .MelliConfig (PostEntity, 'tags')
                .relation (PostEntity, 'tags')
                .of(post)
                .addAndRemove(data.tags, post.tags ?? []);
        }
        await this.repository.update(data.id, {
            ...omit(data, ['id', 'tags', 'category', 'publish', 'author']),
            publishedAt,
        });
        const result = await this.detail(data.id);
        if (!isNil(this.searchService)) await this.searchService.update([result]);
        return result;
    }

    // /**
    //  * 批量删除文章
    //  * @param ids
    //  * @param trash
    //  */
    // async delete(ids: string[], trash?: boolean) {
    //     const items = await this.repository
    //         .buildBaseQB()
    //         .where('post.id IN (:...ids)', { ids })
    //         .withDeleted()
    //         .getMany();
    //     let result: PostEntity[] = [];
    //     if (trash) {
    //         // 对已软删除的数据再次删除时直接通过remove方法从数据库中清除
    //         const directs = items.filter((item) => !isNil(item.deletedAt));
    //         const directIds = directs.map(({ id }) => id);
    //         const softs = items.filter((item) => isNil(item.deletedAt));
    //         result = [
    //             ...(await this.repository.remove(directs)),
    //             ...(await this.repository.softRemove(softs)),
    //         ];
    //         if (!isNil(this.searchService)) {
    //             await this.searchService.delete(directIds);
    //             await this.searchService.update(softs);
    //         }
    //     } else {
    //         result = await this.repository.remove(items);
    //         if (!isNil(this.searchService)) {
    //             await this.searchService.delete(ids);
    //         }
    //     }
    //     return result;
    // }

    /**
     * 批量删除文章
     * @param ids
     * @param trash
     */
    async delete(ids: string[], trash?: boolean) {
        const items = await this.repository
            .buildBaseQB()
            .where('post.id IN (:...ids)', { ids })
            .withDeleted()
            .getMany();
        let result: PostEntity[] = [];
        if (trash) {
            // 对已软删除的数据再次删除时直接通过remove方法从数据库中清除
            const directs = items.filter((item) => !isNil(item.deletedAt));
            const directIds = directs.map(({ id }) => id);
            const softs = items.filter((item) => isNil(item.deletedAt));
            result = [
                ...(await this.repository.remove(directs)),
                ...(await this.repository.softRemove(softs)),
            ];
            if (!isNil(this.searchService)) {
                await this.searchService.delete(directIds);
                await this.searchService.update(softs);
            }
        } else {
            result = await this.repository.remove(items);
            if (!isNil(this.searchService)) {
                await this.searchService.delete(ids);
            }
        }
        return result;
    }
    

    /**
     * 构建文章列表查询器
     * @param qb 初始查询构造器
     * @param options 排查分页选项后的查询选项
     * @param callback 添加额外的查询
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: FindParams,
        callback?: QueryHook<PostEntity>,
    ) {
        const { category, tag, author, orderBy, search, isPublished, trashed } = options;
        if (typeof isPublished === 'boolean') {
            isPublished
                ? qb.where({
                      publishedAt: Not(IsNull()),
                  })
                : qb.where({
                      publishedAt: IsNull(),
                  });
        }
        this.queryOrderBy(qb, orderBy);
        if (category) await this.queryByCategory(category, qb);
        // 查询某个标签关联的文章
        if (tag) qb.where('tags.id = :id', { id: tag });
        // 根据作者查询文章
        if (author) qb.where('author.id = :id', { id: author });
        // 是否全文搜索
        if (!isNil(search)) this.buildSearchQuery(qb, search);
        // 是否查询回收站
        if (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY) {
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) qb.where(`post.deletedAt is not null`);
        }
        if (callback) return callback(qb);
        return qb;
    }

    /**
     *  对文章进行排序的Query构建
     * @param qb
     * @param orderBy 排序方式
     */
    protected queryOrderBy(qb: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return qb.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return qb.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return qb.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.COMMENTCOUNT:
                return qb.orderBy('commentCount', 'DESC');
            case PostOrderType.CUSTOM:
                return qb.orderBy('customOrder', 'DESC');
            default:
                return qb
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC')
                    .addOrderBy('commentCount', 'DESC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有文章的Query构建
     * @param id
     * @param qb
     */
    protected async queryByCategory(id: string, qb: SelectQueryBuilder<PostEntity>) {
        const root = await this.categoryService.detail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return qb.where('category.id IN (:...ids)', {
            ids,
        });
    }

    // /**
    //  * 恢复文章
    //  * @param ids
    //  */
    // async restore(ids: string[]) {
    //     const items = await this.repository
    //         .buildBaseQB()
    //         .where('post.id IN (:...ids)', { ids })
    //         .withDeleted()
    //         .getMany();
    //     // 过滤掉不在回收站中的数据
    //     const trasheds = items.filter((item) => !isNil(item));
    //     const trashedsIds = trasheds.map((item) => item.id);
    //     await this.repository.restore(trashedsIds);
    //     await this.searchService.update(trasheds);
    //     if (trasheds.length < 1) return [];
    //     await this.repository.restore(trashedsIds);
    //     const qb = await this.buildListQuery(this.repository.buildBaseQB(), {}, async (qbuilder) =>
    //         qbuilder.andWhereInIds(trashedsIds),
    //     );
    //     return qb.getMany();
    // }

    /**
     * 恢复文章
     * @param ids
     */
    async restore(ids: string[]) {
        const items = await this.repository
            .buildBaseQB()
            .where('post.id IN (:...ids)', { ids })
            .withDeleted()
            .getMany();
        // 过滤掉不在回收站中的数据
        const trasheds = items.filter((item) => !isNil(item));
        const trashedsIds = trasheds.map((item) => item.id);
        if (trasheds.length < 1) return [];
        await this.repository.restore(trashedsIds);
        if (!isNil(this.searchService)) {
            await this.searchService.update(trasheds);
        }
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), {}, async (qbuilder) =>
            qbuilder.andWhereInIds(trashedsIds),
        );
        return qb.getMany();
    }

    /**
     * 构建mysql全文搜索的sql
     * @param qb
     * @param search
     */
    protected async buildSearchQuery(qb: SelectQueryBuilder<PostEntity>, search: string) {
        qb.andWhere('title LIKE :search', { search: `%${search}%` })
            .orWhere('body LIKE :search', { search: `%${search}%` })
            .orWhere('summary LIKE :search', { search: `%${search}%` })
            .orWhere('category.name LIKE :search', {
                search: `%${search}%`,
            })
            .orWhere('tags.name LIKE :search', {
                search: `%${search}%`,
            })
            .orWhere('author.username LIKE :search', {
                search: `%${search}%`,
            })
            .orWhere('author.nickname LIKE :search', {
                search: `%${search}%`,
            });
        return qb;
    }
}