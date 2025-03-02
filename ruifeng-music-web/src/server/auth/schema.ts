import { z } from 'zod';

/**
 * 登录请求数据结构
 */
export const authLoginRequestSchema = z.object({
    credential: z.string().min(1, '用户名或邮箱不能为空'),
    password: z.string().min(8, '密码至少8位'),
});

/**
 * 登录响应数据结构
 */
export const authLoginResponseSchema = z.object({
    token: z.string(),
});

/**
 * 用户数据结构
 */
export const authItemSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string().email(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});

/**
 * 获取用户信息响应数据结构
 */
export const authProfileResponseSchema = z.object({
    result: z.boolean(),
    data: authItemSchema.or(z.null()),
});

/**
 * 登出响应数据结构
 */
export const authLogoutResponseSchema = z.object({
    message: z.string(),
});
