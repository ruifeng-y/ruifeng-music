import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserEntity } from '../entities';
/**
 * 当前用户装饰器
 * 通过request查询通过jwt解析出来的当前登录的ID查询当前用户模型实例
 * 并用于控制器直接注入
 * 这个装饰器用于从当前请求中获取当前用户对象（JWT策略类的validate方法解析出来的）
 * 
 * _data和ctx参数：_data参数通常不使用，因为参数装饰器通常不直接使用这个参数。
 * ctx参数是一个ExecutionContext对象，它包含了当前请求的上下文信息。
 */
export const ReqUser = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    // 获取请求对象：通过ctx.switchToHttp().getRequest()方法，可以从上下文中获取当前的HTTP请求对象。
    //  这个请求对象包含了当前请求的所有信息，包括请求头、请求体、请求参数等。
    const request = ctx.switchToHttp().getRequest();
    // 类型断言：request.user被断言为UserEntity类型，这意味着我们期望请求对象中包含一个user属性，并且这个属性是一个UserEntity类型的实例。
    return request.user as ClassToPlain<UserEntity>;
});