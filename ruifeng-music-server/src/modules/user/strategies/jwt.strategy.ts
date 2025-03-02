import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { instanceToPlain } from 'class-transformer';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Configure } from '@/modules/config/configure';

import { UserRepository } from '../repositories/user.repository';
import { JwtPayload } from '../types';
/**
 * 用户认证JWT策略
 * JWT策略
 * JWT策略用于在访问一个端点API是检测用户是否已登录（即拥有存在数据库中，并和当前用户对应且未过期的有效accessToken）。
 * 默认的JWT策略类使用PassportStrategy包装passport-jwt中的Strategy，我们扩展它并自定义一下
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    /**
     * 在构造函数中，我们传入自定义的验证密钥
     * @param configure 
     * @param userRepository 
     */
    constructor(
        protected configure: Configure,
        protected userRepository: UserRepository,
    ) {
        // 获取密钥：通过configure.env.get('USER_TOKEN_SECRET', 'my-access-secret')获取JWT的密钥。
        // 如果环境变量中没有设置USER_TOKEN_SECRET，则使用默认值'my-access-secret'。
        const secret = configure.env.get('USER_TOKEN_SECRET', 'my-access-secret');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    /**
     * 通过荷载解析出用户ID
     * 通过用户ID查询出用户是否存在,并把id放入request方便后续操作
     * @param payload
     */
    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findOneOrFail({ where: { id: payload.sub } });
        return instanceToPlain(user);
    }
}