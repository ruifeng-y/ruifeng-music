import { BadRequestException, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { CredentialDto } from '../dtos/auth.dto';
/**
 * 用户登录守卫
 * 本地验证守卫
 * 有了本地策略后，在请求加了本地守卫 AuthGuard('local')的方法上都会使用本地策略类去进行验证。
 * 因为该守卫的canActivate方法会自动把请求数据传入本地策略类的实例并调用validate方法对用户凭证和密码进行验证。
 * 为了准确的得到验证结果和更精准的返回错误信息，我们继承默认的本地守卫类并重载canActivate。
 * 使用plainToClass(CredentialDto, request.body)把请求数据赋值给CredentialDto的对象并一一对应字段，
 * 然后根据CredentialDto中的字段验证规则先验证请求数据中credential和password等字段的合法性，然后再使用本地策略进行数据准确验证
 */
@Injectable()
// 继承AuthGuard('local')：LocalAuthGuard类继承自AuthGuard类，并传递了字符串参数'local'，这表示它将使用本地身份验证策略。
export class LocalAuthGuard extends AuthGuard('local') {
    // 重写canActivate方法：canActivate方法是一个钩子函数，用于在请求处理之前进行身份验证。在这个方法中，
    // 代码首先获取请求对象，然后对请求体中的数据进行验证。
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        // 数据验证：使用validateOrReject函数对请求体中的数据进行验证。
        // plainToClass函数将请求体数据转换为CredentialDto类的实例，并使用验证规则进行验证。
        // 如果验证失败，将抛出一个BadRequestException异常，并返回验证错误信息。
        try {
            await validateOrReject(plainToClass(CredentialDto, request.body), {
                validationError: { target: false },
            });
        } catch (errors) {
            const messages = (errors as any[])
                .map((e) => e.constraints ?? {})
                .reduce((o, n) => ({ ...o, ...n }), {});
            throw new BadRequestException(Object.values(messages));
        }
        // 最后，调用父类的canActivate方法，并返回其结果。如果验证成功，将返回true，否则返回false。
        return super.canActivate(context) as boolean;
    }
}