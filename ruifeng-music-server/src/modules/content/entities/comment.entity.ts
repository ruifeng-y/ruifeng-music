// src/modules/content/entities/comment.entity.ts
import { BaseEntity, Column, Entity, PrimaryColumn, CreateDateColumn, ManyToOne, Tree, TreeParent, TreeChildren } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { Expose, Type } from 'class-transformer';
import type { Relation } from 'typeorm';
import { UserEntity } from '@/modules/user/entities';

@Tree('materialized-path')
@Entity('content_comments')
export class CommentEntity extends BaseEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @Column({ comment: '评论内容', type: 'text' })
    body: string;
  
    @Expose()
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;


    @Expose({ groups: ['comment-list'] })
    depth = 0;

    @Expose({ groups: ['comment-detail', 'comment-list'] })
    @TreeParent({ onDelete: 'CASCADE' })
    parent: Relation<CommentEntity> | null;

    @Expose({ groups: ['comment-tree'] })
    @Type(() => CommentEntity)
    @TreeChildren({ cascade: true })
     children: Relation<CommentEntity>[];

     @ManyToOne(() => PostEntity, (post) => post.comments, {
        // 文章不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post: Relation<PostEntity>;

    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.comments, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    author: Relation<UserEntity>;

}