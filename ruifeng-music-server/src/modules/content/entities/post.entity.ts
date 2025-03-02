// src/modules/content/entities/post.entity.ts
import { Entity, PrimaryColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, 
    ManyToOne, OneToMany, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { Expose, Exclude, Type } from 'class-transformer'; // 导入 Expose 装饰器
import { PostBodyType } from '../constants';
import { CategoryEntity } from '../entities/category.entity';
import { TagEntity } from '../entities/tag.entity';
import { CommentEntity} from '../entities/comment.entity';
import type { Relation } from 'typeorm';
import { UserEntity } from '@/modules/user/entities';

// @Entity('content_posts')
// export class PostEntity extends BaseEntity {
//     @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
//     id: string;

//     @Column({ comment: '文章标题' })
//     title: string;

//     @Column({ comment: '文章内容', type: 'text' })
//     body: string;

//     @Column({ comment: '文章描述', nullable: true })
//     summary?: string;

//     @Expose()
//     @Column({ comment: '关键字', type: 'simple-array', nullable: true })
//     keywords?: string[];

//     @Column({
//         comment: '文章类型',
//         type: 'varchar',
//         // 如果是mysql或者postgresql你可以使用enum类型
//         // enum: PostBodyType,
//         default: PostBodyType.MD,
//     })
//     type: PostBodyType;

//     @Column({
//         comment: '发布时间',
//         type: 'varchar',
//         nullable: true,
//     })
//     publishedAt?: Date | null;

//     @Column({ comment: '自定义文章排序', default: 0 })
//     customOrder: number;

//     @CreateDateColumn({
//         comment: '创建时间',
//     })
//     createdAt: Date;

//     @UpdateDateColumn({
//         comment: '更新时间',
//     })
//     updatedAt: Date;
// }

// src/modules/content/entities/post.entity.ts
@Exclude()
@Entity('content_posts')
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @Column({ comment: '文章标题' })
    title: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'text' })
    body: string;

    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];

    @Expose()
    @Column({
        comment: '文章类型',
        type: 'varchar',
        // 如果是mysql或者postgresql你可以使用enum类型
        // enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type: PostBodyType;

    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;

    @Expose()
    @Column({ comment: '自定义文章排序', default: 0 })
    customOrder: number;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    /**
    * 通过queryBuilder生成的评论数量(虚拟字段)
    */
    @Expose()
    commentCount: number;

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
      comment: '删除时间',
    })
    deletedAt: Date;

    @Expose()
    @ManyToOne(() => CategoryEntity, (category) => category.posts, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    category: Relation<CategoryEntity>
  
    @Expose()
    @ManyToMany(() => TagEntity, (tag) => tag.posts, {
        cascade: true,
    })
    @JoinTable()
    tags: Relation<TagEntity>[];

    @OneToMany(() => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments: Relation<CommentEntity>[];

    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.posts, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    author: Relation<UserEntity>;

}