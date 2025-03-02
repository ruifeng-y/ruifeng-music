import { Entity, ManyToOne, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';

import { BaseToken } from './base.token';
import { RefreshTokenEntity } from './refresh-token.entity';
import { UserEntity } from './user.entity';
/**
 * 用户认证token模型
 * 访问密钥：访问密钥与刷新密钥是一对一的关系，一个访问密钥必然带有一个刷新密钥
 */
@Entity('user_access_tokens')
export class AccessTokenEntity extends BaseToken {
    /**
     * 关联的刷新令牌
     */
    @OneToOne(() => RefreshTokenEntity, (refreshToken) => refreshToken.accessToken, {
        cascade: true,
    })
    refreshToken: RefreshTokenEntity;

    /**
     * 添加与用户模型的关联关系：一个用户可能使用不同的设备登录，所以用户与访问密钥间是一对多的关系
     */
    @ManyToOne((type) => UserEntity, (user) => user.accessTokens, {
        onDelete: 'CASCADE',
    })
    user: Relation<UserEntity>;
}