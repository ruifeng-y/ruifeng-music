// src/modules/content/services/category.service.ts
import {
    Injectable,
} from '@nestjs/common';
import { isNil, omit } from 'lodash';
import { CategoryEntity } from '@/modules/content/entities/category.entity';
import { EntityNotFoundError } from 'typeorm';
import { CategoryRepository } from '@/modules/content/repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/content/dtos/category.dto';
import { BaseService } from '../../database/base/service';
/**
 * 分类数据操作
 */
@Injectable()
export class CategoryService extends BaseService<CategoryEntity, CategoryRepository>{
    // constructor(protected repository: CategoryRepository) {}

    constructor(protected repository: CategoryRepository) {
        super(repository);
    }

    /**
     * 查询分类树
     */
    async findTrees() {
        return this.repository.findTrees();
    }

    // /**
    //  * 获取分页数据
    //  * @param options 分页选项
    //  */
    // async paginate(options: QueryCategoryDto) {
    //     const tree = await this.repository.findTrees();
    //     const data = await this.repository.toFlatTrees(tree);
    //     return treePaginate(options, data);
    // }

    // /**
    //  * 获取数据详情
    //  * @param id
    //  */
    // async detail(id: string) {
    //     return this.repository.findOneOrFail({
    //         where: { id },
    //         relations: ['parent'],
    //     });
    // }

    /**
     * 新增分类
     * @param data
     */
    async create(data: CreateCategoryDto) {
        const item = await this.repository.save({
            ...data,
            parent: await this.getParent(undefined, data.parent),
        });
        return this.detail(item.id);
    }

    /**
     * 更新分类
     * @param data
     */
   async update(data: UpdateCategoryDto) {
        await this.repository.update(data.id, omit(data, ['id', 'parent']));
        const item = await this.repository.findOneOrFail({
            where: { id: data.id },
            relations: ['parent'],
        });
        const parent = await this.getParent(item.parent?.id, data.parent);
        const shouldUpdateParent =
            (!isNil(item.parent) && !isNil(parent) && item.parent.id !== parent.id) ||
            (isNil(item.parent) && !isNil(parent)) ||
            (!isNil(item.parent) && isNil(parent));
        // 父分类单独更新
        if (parent !== undefined && shouldUpdateParent) {
            item.parent = parent;
            await this.repository.save(item, { reload: true });
        }
        return item;
    }

    // /**
    //  * 删除分类
    //  * @param id
    //  */
    // async delete(id: string) {
    //     const item = await this.repository.findOneOrFail({
    //         where: { id },
    //         relations: ['parent', 'children'],
    //     });
    //     // 把子分类提升一级
    //     if (!isNil(item.children) && item.children.length > 0) {
    //         const nchildren = [...item.children].map((c) => {
    //             c.parent = item.parent;
    //             return item;
    //         });

    //         await this.repository.save(nchildren, { reload: true });
    //     }
    //     return this.repository.remove(item);
    // }

    // /**
    //  * 批量删除分类
    //  * @param ids
    //  */
    // async delete(ids: string[]) {
    //     const items = await this.repository.find({
    //         where: { id: In(ids) as any },
    //         relations: ['parent', 'children'],
    //     });
    //     for (const item of items) {
    //         if (isNil(item.children) || item.children.length <= 0) continue;
    //         // 把子分类提升一级
    //         const nchildren = [...item.children].map((c) => {
    //             c.parent = item.parent;
    //             return item;
    //         });
    //         await this.repository.save(nchildren);
    //     }
    //     return this.repository.remove(items);
    // }

    /**
     * 获取请求传入的父分类
     * @param current 当前分类的ID
     * @param id
     */
    protected async getParent(current?: string, parentId?: string) {
        if (current === parentId) return undefined;
        let parent: CategoryEntity | undefined;
        if (parentId !== undefined) {
            if (parentId === null) return null;
            parent = await this.repository.findOne({ where: { id: parentId } });
            if (!parent)
                throw new EntityNotFoundError(
                    CategoryEntity,
                    `Parent category ${parentId} not exists!`,
                );
        }
        return parent;
    }
}