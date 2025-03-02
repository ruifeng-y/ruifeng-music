// src/modules/content/entities/tag.entity.ts
import { Column, Entity, PrimaryColumn, ManyToMany } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { Expose } from 'class-transformer';
import type { Relation } from 'typeorm';

// 标签
@Entity('content_tags')
export class TagEntity {
    /**
     * id
     */
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    /**
     * 标签名称
     */
    @Expose()
    @Column({ comment: '标签名称', unique: true  })
    name: string;
  
    /**
     * 标签描述
     */
    @Expose()
    @Column({ comment: '标签描述', nullable: true })
    description?: string;

    /**
     * 通过queryBuilder生成的文章数量(虚拟字段)
    */
    @Expose()
    postCount: number;

    @ManyToMany(() => PostEntity, (post) => post.tags)
    posts: Relation<PostEntity[]>;

}