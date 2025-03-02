// src/database/seeders/content.seeder.ts
import fs from 'fs';

import path from 'path';

import { faker } from '@faker-js/faker';
import { existsSync } from 'fs-extra';
import { DataSource, EntityManager, In } from 'typeorm';

import { CategoryEntity, CommentEntity, PostEntity, TagEntity } from '@/modules/content/entities';
import { CategoryRepository, TagRepository } from '@/modules/content/repositories';

import { getRandItemData, getRandListData, panic } from '@/modules/core/helpers';
import { BaseSeeder } from '@/modules/database/base/seeder';

import { DbFactory } from '@/modules/database/commands/types';

import { SystemRoles } from '@/modules/rbac/constants';
// import { RoleEntity } from '@/modules/rbac/entities';
// import { UserEntity } from '@/modules/user/entities';
// import { UserRepository } from '@/modules/user/repositories';
import { isNil } from 'lodash';

import { getCustomRepository } from '../../modules/database/helpers';
import {
    categories,
    CategoryData,
    tags,
    PostData,
    posts,
    TagData,
} from '../factories/content.data';
import { IPostFactoryOptions } from '../factories/content.factory';
import { UserEntity } from '@/modules/user/entities';
import { UserRepository } from '@/modules/user/repositories';
import { RoleEntity } from '@/modules/rbac/entities';

/**
 * 填充实现
truncates: 用于指定忽略锁定状态下会被清空的数据表模型
loadCategories: 用于注入分类模拟数据
loadTags: 用于注入标签模拟数据
loadPosts: 用于注入文章模拟数据
注入文章模拟数据的步骤如下

查出所有的分类和标签数据

遍历预定义的文章数据

以body的值为文件名称去读取对应的markdown文件中的文章内容，读取后作为body字段的内容

查询出关联的分类和标签，然后使用工厂实例去创建这篇文章

接着，通过genRandomComments为这边文章生成一些数据随机评论

在预定义文章之外我们使用数据工厂生成几十条随机的文章
 */

export default class ContentSeeder extends BaseSeeder {
    protected truncates = [PostEntity, TagEntity, CategoryEntity, CommentEntity];

    protected users: UserEntity[] = [];

    protected factorier: DbFactory;

    async run(_factorier: DbFactory, _dataSource: DataSource, _em: EntityManager): Promise<any> {
        this.factorier = _factorier;
        const userRepo = getCustomRepository(this.dataSource, UserRepository);
        this.users = await userRepo.find({ take: 5 });
        await this.loadCategories(categories);
        await this.loadTags(tags);
        await this.loadPosts(posts);
    }

    private async genRandomComments(post: PostEntity, count: number, parent?: CommentEntity) {
        const comments: CommentEntity[] = [];
        for (let i = 0; i < count; i++) {
            const comment = new CommentEntity();
            comment.body = faker.lorem.paragraph(Math.floor(Math.random() * 18) + 1);
            comment.post = post;
            if (parent) comment.parent = parent;
            comment.author = getRandItemData(this.users);
            comments.push(await this.em.save(comment));
            if (Math.random() >= 0.8) {
                comment.children = await this.genRandomComments(
                    post,
                    Math.floor(Math.random() * 2),
                    comment,
                );
                await this.em.save(comment);
            }
        }
        return comments;
    }

    private async loadCategories(data: CategoryData[], parent?: CategoryEntity): Promise<void> {
        let order = 0;
        for (const item of data) {
            const category = new CategoryEntity();
            category.name = item.name;
            category.customOrder = order;
            if (parent) category.parent = parent;
            await this.em.save(category);
            order++;
            if (item.children) {
                await this.loadCategories(item.children, category);
            }
        }
    }

    private async loadTags(data: TagData[]): Promise<void> {
        for (const item of data) {
            const tag = new TagEntity();
            tag.name = item.name;
            await this.em.save(tag);
        }
    }

    private async loadPosts(data: PostData[]) {
        const superRole = await this.em.findOneOrFail(RoleEntity, {
            relations: ['permissions'],
            where: { name: SystemRoles.SUPER_ADMIN },
        });
        const superUser = !isNil(superRole)
        ? await this.em
              .createQueryBuilder(UserEntity, 'user')
              .leftJoinAndSelect('user.roles', 'roles')
              .where('roles.id IN (:...ids)', { ids: [superRole.id] })
              .getOne()
        : null;
        const author = !isNil(superUser) ? superUser : getRandItemData(this.users);
        const allCategories = await this.em.find(CategoryEntity);
        // const author = await this.em.createQueryBuilder(UserEntity, 'user').getOne();
        // const allCategories = await this.em.find(CategoryEntity);
        const allTags = await this.em.find(TagEntity);
        for (const item of data) {
            const filePath = path.join(__dirname, '../../assets/posts', item.contentFile);
            if (!existsSync(filePath)) {
                panic({
                    spinner: this.spinner,
                    message: `post content file ${filePath} not exits!`,
                });
            }
            const options: IPostFactoryOptions = {
                title: item.title,
                body: fs.readFileSync(filePath, 'utf8'),
                isPublished: true,
                author,
            };
            if (item.summary) {
                options.summary = item.summary;
            }
            if (item.category) {
                options.category = await getCustomRepository(
                    this.dataSource,
                    CategoryRepository,
                ).findOneBy({ id: item.category });
            }
            if (item.tags) {
                options.tags = await getCustomRepository(this.dataSource, TagRepository).find({
                    where: { name: In(item.tags) },
                });
            }
            const post = await this.factorier(PostEntity)(options).create();

            await this.genRandomComments(post, Math.floor(Math.random() * 8));
        }
        await this.factorier(PostEntity)<IPostFactoryOptions>({
            tags: getRandListData(allTags),
            category: getRandItemData(allCategories),
            author: getRandItemData(this.users),
        }).createMany(10);
    }
}