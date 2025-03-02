import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Configure } from '../config/configure';
import { DatabaseModule } from '../database/database.module';
import { addEntities, addSubscribers } from '../database/helpers';
import * as entities from './entities';
import * as guards from './guards';
import * as repositories from './repositories';
import * as services from './services';
import * as strategies from './strategies';
import * as subscribers from './subscribers';
import { UserIdInterceptor } from './user.interceptor';

/**
 * 模块类
 * 除了服务，控制器，模型，存储类，订阅者等外，
 * 我们还需要导入PassportModule和 services.AuthService.jwtModuleFactory(configure)（就是JwtModule）两个模块，
 * 并且添加了策略，守卫两种新的提供者
 */
@Module({})
export class UserModule {
    static async forRoot(configure: Configure) {
        return {
            module: UserModule,
            imports: [
                PassportModule,
                PassportModule,
                services.AuthService.jwtModuleFactory(configure),
                addEntities(configure, Object.values(entities)),
                DatabaseModule.forRepository(Object.values(repositories)),
            ],
            providers: [
                UserIdInterceptor,
                ...Object.values(services),
                ...(await addSubscribers(configure, Object.values(subscribers))),
                ...Object.values(strategies),
                ...Object.values(guards),
            ],
            exports: [
                ...Object.values(services),
                DatabaseModule.forRepository(Object.values(repositories)),
            ],
        };
    }
}