import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { FastifyReply as Response } from 'fastify';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { Configure } from '@/modules/config/configure';

import { getTime } from '@/modules/core/helpers';

import { getUserConfig } from '../config';
import { AccessTokenEntity } from '../entities/access-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UserEntity } from '../entities/user.entity';
import { JwtConfig, JwtPayload } from '../types';
/**
 * 令牌服务
 */
@Injectable()
export class TokenService {
    constructor(
        protected configure: Configure,
        protected jwtService: JwtService,
    ) {}

    /**
     * 根据accessToken刷新AccessToken与RefreshToken
     * @param accessToken 类型为AccessTokenEntity，表示当前有效的访问令牌。
     * @param response 类型为Response，表示HTTP响应对象，用于设置新的访问令牌。
     */
    async refreshToken(accessToken: AccessTokenEntity, response: Response) {
        // 从accessToken对象中解构出user和refreshToken。
        const { user, refreshToken } = accessToken;
        if (refreshToken) {
            const now = await getTime(this.configure);
            // 判断refreshToken是否过期 如果过期，则返回null。
            if (now.isAfter(refreshToken.expired_at)) return null;
            // 如果没过期则生成新的access_token和refresh_token
            const token = await this.generateAccessToken(user, now);
            // 调用accessToken.remove()方法移除旧的访问令牌。
            await accessToken.remove();
            // 使用response.header('token', token.accessToken.value)方法将新的访问令牌设置到响应头中。
            response.header('token', token.accessToken.value);
            return token;
        }
        return null;
    }

    /**
     * 根据荷载签出新的AccessToken并存入数据库
     * 且自动生成新的Refresh也存入数据库
     * @param user 表示当前的用户实体，包含了用户的详细信息
     * @param now 表示当前的时间，使用dayjs库来处理日期和时间。
     */
    async generateAccessToken(user: UserEntity, now: dayjs.Dayjs) {
        // 通过getUserConfig函数获取JWT相关的配置信息，这些配置信息可能包括令牌的有效期等。
        const config = await getUserConfig<JwtConfig>(this.configure, 'jwt');
        // 创建一个包含用户ID和当前时间戳的负载对象，用于生成访问令牌。
        const accessTokenPayload: JwtPayload = {
            sub: user.id,
            iat: now.unix(),
        };

        // 使用jwtService的sign方法，根据负载对象生成一个签名的访问令牌。
        const signed = this.jwtService.sign(accessTokenPayload);
        // 创建一个AccessTokenEntity实例，设置其值为生成的访问令牌，关联的用户为当前用户，
        // 并设置其过期时间为当前时间加上配置的令牌有效期。然后，将这个实体保存到数据库中。
        const accessToken = new AccessTokenEntity();
        accessToken.value = signed;
        accessToken.user = user;
        accessToken.expired_at = now.add(config.token_expired, 'second').toDate();
        await accessToken.save();

        // 调用generateRefreshToken方法，生成一个新的刷新令牌，并将其与访问令牌关联。最后，将访问令牌和刷新令牌返回。
        const refreshToken = await this.generateRefreshToken(
            accessToken,
            await getTime(this.configure),
        );
        return { accessToken, refreshToken };
    }

    /**
     * 生成新的RefreshToken并存入数据库
     * @param accessToken
     * @param now
     */
    async generateRefreshToken(
        accessToken: AccessTokenEntity,
        now: dayjs.Dayjs,
    ): Promise<RefreshTokenEntity> {
        const config = await getUserConfig<JwtConfig>(this.configure, 'jwt');
        const refreshTokenPayload = {
            uuid: uuid(),
        };
        const refreshToken = new RefreshTokenEntity();
        refreshToken.value = jwt.sign(
            refreshTokenPayload,
            this.configure.env.get('USER_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
        );
        refreshToken.expired_at = now.add(config.refresh_token_expired, 'second').toDate();
        refreshToken.accessToken = accessToken;
        await refreshToken.save();
        return refreshToken;
    }

    /**
     * 检查accessToken是否存在
     * @param value
     */
    async checkAccessToken(value: string) {
        return AccessTokenEntity.findOne({
            where: { value },
            relations: ['user', 'refreshToken'],
        });
    }

    /**
     * 移除AccessToken且自动移除关联的RefreshToken
     * @param value
     */
    async removeAccessToken(value: string) {
        const accessToken = await AccessTokenEntity.findOne({
            where: { value },
        });
        if (accessToken) await accessToken.remove();
    }

    /**
     * 移除RefreshToken
     * @param value
     */
    async removeRefreshToken(value: string) {
        const refreshToken = await RefreshTokenEntity.findOne({
            where: { value },
            relations: ['accessToken'],
        });
        if (refreshToken) {
            if (refreshToken.accessToken) await refreshToken.accessToken.remove();
            await refreshToken.remove();
        }
    }

    /**
     * 验证Token是否正确,如果正确则返回所属用户对象
     * @param token
     */
    async verifyAccessToken(token: AccessTokenEntity) {
        const result = jwt.verify(
            token.value,
            this.configure.env.get('USER_TOKEN_SECRET', 'my-access-secret'),
        );
        if (!result) return false;
        return token.user;
    }
}