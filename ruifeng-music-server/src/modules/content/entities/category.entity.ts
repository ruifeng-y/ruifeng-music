// src/modules/content/entities/category.entity.ts
import { BaseEntity, Column, Entity, PrimaryColumn, OneToMany, Tree, TreeParent, TreeChildren } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import type { Relation } from 'typeorm';

// 分类
@Exclude()
@Tree('materialized-path')
@Entity('content_categories')
export class CategoryEntity extends BaseEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @Column({ comment: '分类名称', unique: true })
    name: string;

    @Expose({ groups: ['category-tree', 'category-list', 'category-detail'] })
    @Column({ comment: '分类排序', default: 0 })
    customOrder: number;


    @Expose({ groups: ['category-list'] })
    depth = 0;

    @Expose({ groups: ['category-detail', 'category-list'] })
    @TreeParent({ onDelete: 'NO ACTION' })
    parent: Relation<CategoryEntity> | null;

    @Expose({ groups: ['category-tree'] })
    @Type(() => CategoryEntity)
    @TreeChildren({ cascade: true })
    children: Relation<CategoryEntity>[];

    @OneToMany(() => PostEntity, (post) => post.category, {
        cascade: true,
    })
    posts: Relation<PostEntity[]>;
}