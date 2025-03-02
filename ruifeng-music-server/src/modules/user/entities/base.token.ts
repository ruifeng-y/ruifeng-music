import { Exclude } from 'class-transformer';
import { BaseEntity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

/**
 * Token模型
 * 公共字段：token与refresh_token有一些都有的通用字段，我们可以把它们抽象出来
 * AccessToken与RefreshToken的公共字段
 */
@Exclude()
export abstract class BaseToken extends BaseEntity {
    @PrimaryColumn({ type: 'varchar', generated: 'uuid', length: 36 })
    id: string;

    @Column({ length: 500, comment: '令牌字符串' })
    value: string;

    @Column({
        comment: '令牌过期时间',
    })
    expired_at: Date;

    @CreateDateColumn({
        comment: '令牌创建时间',
    })
    createdAt: Date;
}