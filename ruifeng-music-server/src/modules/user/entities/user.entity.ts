import { Exclude, Expose, Type } from 'class-transformer';

import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { CommentEntity, PostEntity } from '@/modules/content/entities';

import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { AccessTokenEntity } from './access-token.entity';
/**
 * 用户模型 对应用户表(后续我们可以细化，比如拆分用户表和用户信息表等)
 * JWT Token模型：有两个表组成，用于用户访问的access_token，这个token返回给前端；用于无痛刷新的token，用于延长登录时间
 */
@Exclude()
@Entity('users')
export class UserEntity {
    @Expose()
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Expose()
    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户名', unique: true })
    username: string;

    @Column({ comment: '密码', length: 500, select: false })
    password: string;

    @Expose()
    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Expose()
    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '用户创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '用户更新时间',
    })
    updatedAt: Date;

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;

    // 添加关联与反向关联关系：用户与文章一对多（一个用户可以发布多篇文章）、用户与评论一对多（一个用户可以发表多条评论）

    @OneToMany(() => PostEntity, (post) => post.author, {
        cascade: true,
    })
    posts: Relation<PostEntity>[];

    @OneToMany(() => CommentEntity, (comment) => comment.author, {
        cascade: true,
    })
    comments: Relation<CommentEntity>[];

    /**
     * 添加与用户模型的关联关系：一个用户可能使用不同的设备登录，所以用户与访问密钥间是一对多的关系
     */
    @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user, {
        cascade: true,
    })
    accessTokens: Relation<AccessTokenEntity>[];

    // 添加与用户模型的关联关系：用户与角色、权限间是多对多的关系
    @Expose()
    @ManyToMany(() => RoleEntity, (role) => role.users, { cascade: true })
    roles: Relation<RoleEntity>[];


    @Expose()
    @ManyToMany(() => PermissionEntity, (permisson) => permisson.users, {
        cascade: true,
    })
    permissions: Relation<PermissionEntity>[];
}