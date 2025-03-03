import bcrypt from 'bcryptjs';

import { Configure } from '../config/configure';

import { getUserConfig } from './config';
/**
 * 密码加密和对比
   用户密码一般不会使用明文直接存储在数据库中，这样非常不安全，所以此处我们选择使用bcrypt对密码进行加密后存储

   这里的hash是密码混淆值，默认为10位，我们可以在用户配置中进行自定义位数。
 */

/**
 * 加密明文密码
 * @param configure
 * @param password
 */
export const encrypt = async (configure: Configure, password: string) => {
    // 获取配置中的hash值，默认为10
    const hash = (await getUserConfig<number>(configure, 'hash')) || 10;
    // 使用bcrypt库对密码进行加密
    return bcrypt.hashSync(password, hash);
};

/**
 * 验证密码
 * @param password
 * @param hashed
 */
export const decrypt = (password: string, hashed: string) => {
    // 使用bcrypt.compareSync方法比较密码和哈希值
    return bcrypt.compareSync(password, hashed);
};