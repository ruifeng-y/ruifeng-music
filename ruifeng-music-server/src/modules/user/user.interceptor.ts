import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { isNil } from 'lodash';
import { Observable } from 'rxjs';
/**
 * 用户拦截器
 * 当一个用户登录后，需要更新自己的账户用户名时，需要对用户名进行唯一性验证。
 * 但并不需要像后台管理那样在请求中传自己的id进行唯一性忽略，而是可以通过当前登录的token获取用户ID。
 * 然后把id赋值给request.body.userId，因为DTO可以拿到body，这就是我们的方案！
 * 但需要设置DTO为whitelist: false，因为userId不在DTO类的属性列表内，可以看到前面编写的UpdateAccountDto这个DTO。
 */
@Injectable()
export class UserIdInterceptor implements NestInterceptor {
    // intercept方法：这是拦截器的核心方法，它接收两个参数：context和next
    // context：这是当前的请求上下文，它包含了请求的所有信息，例如请求头、请求体、请求参数等
    // next：是一个CallHandler对象，调用next.handle()方法可以继续处理请求。
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // 获取请求对象：通过context.switchToHttp().getRequest()方法获取当前的HTTP请求对象。
        const request: any = context.switchToHttp().getRequest();
        // 检查用户ID：使用isNil函数检查请求对象中的user属性是否存在且不为null或undefined，并且user对象中是否存在id属性。
        if (!isNil(request.user?.id)) {
            // 设置请求体中的用户ID：如果用户ID存在，检查请求体是否存在。如果不存在，则创建一个新的请求体对象，并将用户ID添加到其中。
            if (isNil(request.body)) request.body = { userId: request.user.id };
            // 如果请求体已存在，则直接将用户ID添加到请求体中。
            else request.body.userId = request.user.id;
        }
        // 继续处理请求：调用next.handle()方法继续处理请求。
        return next.handle();
    }
}