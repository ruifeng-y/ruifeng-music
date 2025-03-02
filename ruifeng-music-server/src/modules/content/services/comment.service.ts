// src/modules/content/services/comment.service.ts
import {
    Injectable,
    ForbiddenException
} from '@nestjs/common';
import { isNil } from 'lodash';
import { PostRepository } from '../repositories/post.repository';
import { CommentEntity } from '@/modules/content/entities/comment.entity';
import { SelectQueryBuilder,EntityNotFoundError, In } from 'typeorm';
import { CommentRepository } from '@/modules/content/repositories/comment.repository';
import { QueryCommentTreeDto, QueryCommentDto, CreateCommentDto } from '@/modules/content/dtos/comment.dto';
import { BaseService } from '../../database/base/service';
import { UserEntity } from '@/modules/user/entities';
import { UserRepository } from '@/modules/user/repositories';

/**
 * 评论数据操作
 */
@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository>{
    constructor(
        protected repository: CommentRepository,
        protected userRepository: UserRepository,
        protected postRepository: PostRepository,
    ) {
        super(repository);
    }

    // /**
    //  * 直接查询评论树
    //  * @param options
    //  */
    // async findTrees(options: QueryCommentTreeDto = {}) {
    //     return this.repository.findTrees({
    //         addQuery: (qb) => {
    //             return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
    //         },
    //     });
    // }

    /**
     * 直接查询评论树
     * @param options
     */
    async findTrees(options: QueryCommentTreeDto = {}) {
        return this.repository.findTrees(options);
    }

    // /**
    //  * 查找一篇文章的评论并分页
    //  * @param dto
    //  */
    // async paginate(dto: QueryCommentDto) {
    //     const { post, ...query } = dto;
    //     const addQuery = (qb: SelectQueryBuilder<CommentEntity>) => {
    //         const condition: Record<string, string> = {};
    //         if (!isNil(post)) condition.post = post;
    //         return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
    //     };
    //     const data = await this.repository.findRoots({
    //         addQuery,
    //     });
    //     let comments: CommentEntity[] = [];
    //     for (let i = 0; i < data.length; i++) {
    //         const c = data[i];
    //         comments.push(
    //             await this.repository.findDescendantsTree(c, {
    //                 addQuery,
    //             }),
    //         );
    //     }
    //     comments = await this.repository.toFlatTrees(comments);
    //     return treePaginate(query, comments);
    // }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(options: QueryCommentDto) {
        const { post, author } = options;
        const addQuery = (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, string> = {};
            if (!isNil(post)) condition.post = post;
            if (!isNil(author)) condition.author = author;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return super.paginate({
            ...options,
            addQuery,
        });
    }

    // /**
    //  * 新增评论
    //  * @param data
    //  * @param user
    //  */
    // async create(data: CreateCommentDto) {
    //     const parent = await this.getParent(undefined, data.parent);
    //     if (!isNil(parent) && parent.post.id !== data.post) {
    //         throw new ForbiddenException('Parent comment and child comment must belong same post!');
    //     }
    //     const item = await this.repository.save({
    //         ...data,
    //         parent,
    //         post: await this.getPost(data.post),
    //     });
    //     return this.repository.findOneOrFail({ where: { id: item.id } });
    // }

    /**
     * 新增评论
     * @param data
     * @param user
     */
    async create(data: CreateCommentDto,author: ClassToPlain<UserEntity>) {
        const parent = await this.getParent(undefined, data.parent);
        if (!isNil(parent) && parent.post.id !== data.post) {
            throw new ForbiddenException('Parent comment and child comment must belong same post!');
        }
        const item = await this.repository.save({
            ...data,
            parent,
            post: await this.getPost(data.post),
            author: await this.userRepository.findOneByOrFail({ id: author.id }),
        });
        return this.repository.findOneOrFail({ where: { id: item.id } });
    }

    // /**
    //  * 删除评论
    //  * @param id
    //  */
    // async delete(id: string) {
    //     const comment = await this.repository.findOneOrFail({ where: { id: id ?? null } });
    //     return this.repository.remove(comment);
    // }

    /**
    * 批量删除评论
    * @param ids
    */
    async delete(ids: string[]) {
        const comments = await this.repository.find({ where: { id: In(ids) } });
        return this.repository.remove(comments);
    }

    /**
     * 获取评论所属文章实例
     * @param id
     */
    protected async getPost(id: string) {
        return !isNil(id) ? this.postRepository.findOneOrFail({ where: { id } }) : id;
    }

    /**
     * 获取请求传入的父分类
     * @param current 当前分类的ID
     * @param id
     */
    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repository.findOne({
                relations: ['parent', 'post'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }
}