import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';

import { Configure } from '@/modules/config/configure';
import { getTime } from '@/modules/core/helpers';

import { defaultUserConfig } from '../config';
import { RegisterDto, UpdatePasswordDto } from '../dtos';
import { UserEntity } from '../entities/user.entity';
import { decrypt } from '../helpers';

import { UserRepository } from '../repositories';
import { UserConfig } from '../types';

import { TokenService } from './token.service';
import { UserService } from './user.service';
/**
 * 账户与认证服务
 */
@Injectable()
export class AuthService {
    // 这是类的构造函数，用于初始化类的实例。
    constructor(
        // 这是一个类型为Configure的属性，用于配置相关的服务
        protected configure: Configure,
        // 这是一个类型为UserService的属性，用于处理用户相关的服务。
        protected userService: UserService,
        // 这是一个类型为TokenService的属性，用于处理与令牌相关的服务。
        protected tokenService: TokenService,
        // 这是一个类型为UserRepository的属性，用于与用户存储库进行交互。
        protected userRepository: UserRepository,
    ) {}

    /**
     * 用户登录验证
     * @param credential  用户提供的凭据，通常是用户名或邮箱。
     * @param password 用户提供的密码。
     */
    async validateUser(credential: string, password: string) {
        // 通过credential查询用户信息，并选择用户密码字段。
        // 调用userService的findOneByCredential方法，传入credential和查询配置函数
        // 查询配置函数使用query.addSelect('user.password')来指定只选择用户密码字段。
        const user = await this.userService.findOneByCredential(credential, async (query) =>
            query.addSelect('user.password'),
        );
        //首先检查user是否存在。
        // 如果存在，调用decrypt函数（假设这是一个用于解密密码的函数）来比较用户提供的密码和数据库中存储的密码。如果密码匹配，则返回用户信息。
        // 如果密码不匹配或用户不存在，返回false。
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 登录用户,并生成新的token和refreshToken
     * @param user
     */
    async login(user: UserEntity) {
        // getTime是一个异步函数，用于获取当前时间。this.configure是配置对象，可能包含一些时间相关的配置。
        const now = await getTime(this.configure);
        // generateAccessToken是一个异步函数，用于生成访问令牌。它接受用户信息和当前时间作为参数，并返回一个包含访问令牌的对象。
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 注销登录
     * @param req 类型为Request，表示HTTP请求对象。
     */
    async logout(req: Request) {
        // 提取访问令牌:
        // 使用ExtractJwt.fromAuthHeaderAsBearerToken()方法从请求头中提取Bearer Token。
        // 这个方法会从请求头中查找名为Authorization的键，并提取其值（即访问令牌）。
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
        // 检查访问令牌是否存在: 如果访问令牌存在，调用tokenService的removeAccessToken方法来删除访问令牌。
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        // 返回注销成功信息
        return {
            msg: 'logout_success',
        };
    }

    /**
     * 登录用户后生成新的token和refreshToken
     * @param id 表示用户的唯一标识符。
     */
    async createToken(id: string) {
        // getTime是一个异步函数，用于获取当前时间。this.configure可能是一个配置对象，用于传递给getTime函数。
        // await关键字用于等待getTime函数的执行结果，并将结果赋值给now变量。
        const now = await getTime(this.configure);
        let user: UserEntity;
        try {
            // this.userService.detail(id)是一个异步函数，用于根据用户ID获取用户详细信息。如果获取成功，将用户实体赋值给user变量。如果获取失败，抛出ForbiddenException异常。
            user = await this.userService.detail(id);
        } catch (error) {
            throw new ForbiddenException();
        }
        // generateAccessToken是一个异步函数，用于生成访问令牌。它接受用户信息和当前时间作为参数，并返回一个包含访问令牌的对象。
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        // 返回生成的访问令牌的值。
        return accessToken.value;
    }

    /**
     * 使用用户名密码注册用户
     * @param data
     */
    async register(data: RegisterDto) {
        // 通过解构赋值，从data中提取出username、nickname和password三个属性。
        const { username, nickname, password } = data;
        const user = await this.userService.create({
            username,
            nickname,
            password,
            actived: true,
        } as any);
        // 创建用户后，通过this.userService.findOneByCondition方法，根据用户ID查找刚刚创建的用户对象。
        // 这个方法接收一个条件对象，这里条件是{ id: user.id }，即查找ID与创建的用户ID相同的用户。
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 更新用户密码
     * @param user
     * @param param1 { password, oldPassword }: UpdatePasswordDto：表示更新密码时需要提供的新密码和旧密码，这两个参数来自UpdatePasswordDto数据传输对象。
     */
    async updatePassword(user: UserEntity, { password, oldPassword }: UpdatePasswordDto) {
        // 使用userRepository的findOneOrFail方法查找用户信息，并只选择password字段。
        // findOneOrFail方法会返回一个用户实体，如果找不到用户会抛出异常。
        const item = await this.userRepository.findOneOrFail({
            select: ['password'],
            where: { id: user.id },
        });
        // 使用decrypt函数对旧密码进行解密，并与数据库中的密码进行比较。如果密码不匹配，抛出ForbiddenException异常。
        if (!decrypt(oldPassword, item.password))
            throw new ForbiddenException('old password not matched');
        // save方法接受一个对象，其中包含要更新的用户ID和新的密码。
        // reload: true参数表示在更新后重新加载用户实体，确保返回的是更新后的数据。
        await this.userRepository.save({ id: user.id, password }, { reload: true });
        // 调用userService的detail方法获取更新后的用户详情，并返回。
        return this.userService.detail(user.id);
    }

    /**
     * 导入Jwt模块
     */
    static jwtModuleFactory(configure: Configure) {
        // 导入Jwt模块：通过JwtModule.registerAsync方法注册一个异步的JWT模块配置
        return JwtModule.registerAsync({
            // 配置工厂函数：使用useFactory方法定义一个异步工厂函数，该函数返回一个JwtModuleOptions对象，该对象包含了JWT模块的配置选项。
            useFactory: async (): Promise<JwtModuleOptions> => {
                // 获取配置：通过configure.get方法获取用户配置，如果配置不存在，则使用defaultUserConfig函数提供的默认配置。
                const config = await configure.get<UserConfig>(
                    'user',
                    defaultUserConfig(configure),
                );
                // 设置JWT选项
                const option: JwtModuleOptions = {
                    // secret：从环境变量中获取，如果没有设置，则使用默认值'my-access-secret'。这个secret用于签名和验证JWT。
                    secret: configure.env.get('USER_TOKEN_SECRET', 'my-access-secret'),
                    // verifyOptions：根据环境（开发或生产）设置，开发环境下忽略过期时间，生产环境下不忽略。这个选项用于验证JWT。
                    verifyOptions: {
                        ignoreExpiration: !configure.env.isProd(),
                    },
                };
                // 生产环境配置：如果当前环境是生产环境，则设置signOptions，指定JWT的过期时间，该时间由用户配置中的jwt.token_expired字段指定。
                if (configure.env.isProd()) {
                    option.signOptions = { expiresIn: `${config.jwt.token_expired}s` };
                }
                return option;
            },
        });
    }
}