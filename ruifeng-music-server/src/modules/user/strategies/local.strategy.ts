import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../services/auth.service';
/**
 * 用户认证本地策略
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    // 依赖注入：LocalStrategy 类通过构造函数注入了一个 AuthService 实例。
    // 这意味着在使用 LocalStrategy 时，会自动注入一个 AuthService 的实例，无需手动创建。
    constructor(protected authService: AuthService) {
        // 继承和扩展：LocalStrategy 继承自 PassportStrategy，并调用父类的构造函数，传递一个配置对象。
        // 这个配置对象定义了用户名和密码的字段名，分别是 credential 和 password。
        super({
            usernameField: 'credential',
            passwordField: 'password',
        });
    }

    /**
     * 这个validate方法的主要用途是在用户登录时验证用户的凭据和密码。如果验证成功，它会返回用户对象，否则会抛出异常，表示用户未授权。
     * @param credential 用户的凭据，通常是一个用户名或电子邮件地址。
     * @param password 用户的密码。
     * @returns 
     */
    async validate(credential: string, password: string): Promise<any> {
        // 用户验证：方法内部首先调用this.authService.validateUser(credential, password)，
        // 这是一个异步操作，用于验证用户的凭据和密码。
        const user = await this.authService.validateUser(credential, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}