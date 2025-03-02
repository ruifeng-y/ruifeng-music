import { get, isNil, toNumber } from 'lodash';

import { Configure } from '../config/configure';

import { ConfigureFactory, ConfigureRegister } from '../config/types';

import { UserConfig } from './types';
/**
 * 默认用户配置
 * 该函数接收一个Configure类型的参数，并返回一个UserConfig类型的对象。
 * 这个函数的主要目的是为用户配置提供默认值，并允许通过环境变量来覆盖这些默认值。
 */
export const defaultUserConfig = (configure: Configure): UserConfig => {
    return {
        // 哈希值
        hash: 10,
        // jwt配置
        jwt: {
            // token过期时间 
            // token_expired属性通过configure.env.get方法获取，该方法尝试从环境变量中获取USER_TOKEN_EXPIRED的值，
            // 如果不存在则使用默认值3600（秒）。
            token_expired: configure.env.get('USER_TOKEN_EXPIRED', (v) => toNumber(v), 3600),
            // refresh token过期时间
            // refresh_token_expired属性同样通过configure.env.get方法获取，尝试从环境变量中获取USER_REFRESH_TOKEN_EXPIRED的值，
            // 如果不存在则使用默认值3600 * 30（秒）。
            refresh_token_expired: configure.env.get(
                'USER_REFRESH_TOKEN_EXPIRED',
                (v) => toNumber(v),
                3600 * 30,
            ),
        },
    };
};

/**
 * 用户配置创建函数
 * @param register
 */
export const createUserConfig: (
    register: ConfigureRegister<RePartial<UserConfig>>,
) => ConfigureFactory<UserConfig> = (register) => ({
    // 注册用户配置
    register,
    // 默认用户配置
    defaultRegister: defaultUserConfig,
});

/**
 * 获取user模块配置的值
 * @param configure
 * @param key
 */
export async function getUserConfig<T>(configure: Configure, key?: string): Promise<T> {
    // 获取user模块的配置
    const userConfig = await configure.get<UserConfig>('user', defaultUserConfig(configure));
    // 如果没有传入key，则返回整个userConfig
    if (isNil(key)) return userConfig as T;
    // 否则返回指定key的值
    return get(userConfig, key) as T;
}