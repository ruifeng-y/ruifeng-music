// import { SerializeOptions as CookieSerializeOptions } from 'cookie';
// import jwt from 'jsonwebtoken';
// import { isNil, omit } from 'lodash';

// import { authConfig } from '@/config/auth';
// import { AuthItem } from '@/server/auth/types';

// import { fetchApi } from './api';
// import { deleteCookie, setCookie } from './coolkies';
// import { parseStrict } from './ms';

// type AccessTokenCookieOptions = Pick<
//     CookieSerializeOptions,
//     'domain' | 'path' | 'secure' | 'sameSite' | 'partitioned' | 'maxAge' | 'httpOnly'
// > & {
//     name: string;
//     value: string;
// };
// // 存储在cookies中的令牌键名称
// const ACCESS_TOKEN_COOKIE_NAME = 'auth_token';

// /**
//  * 生成jwt token
//  * @param user 用户信息
//  */
// const generateAccessToken = (user: AuthItem) => {
//     // 使用ms解析token有效时间
//     const expiryMs = parseStrict(authConfig.tokenExpiry);
//     return jwt.sign(
//         {
//             id: user.id,
//             username: user.username,
//             // 当前时间+token有效时间 = 过期时间
//             exp: Math.floor(Date.now() / 1000) + expiryMs,
//         },
//         authConfig.jwtSecret,
//     );
// };

// /**
//  * 根据token获取过期时间
//  * @param token
//  */
// const getTokenExpirationTime = (token: string): number => {
//     const payload = jwt.decode(token) as any;
//     if (!isNil(payload?.exp)) {
//         const expiresIn = Number(payload.exp) - Math.floor(Date.now() / 1000);
//         if (expiresIn <= 0) {
//             throw new Error('令牌已过期');
//         }
//         return expiresIn;
//     }
//     throw new Error('令牌解析错误');
// };

// /**
//  * 获取access token的cookie选项
//  * @param token
//  */
// const getAccessTokenOptions = (token: string): AccessTokenCookieOptions => {
//     const maxAge = getTokenExpirationTime(token);
//     return {
//         name: ACCESS_TOKEN_COOKIE_NAME,
//         value: token,
//         maxAge,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//     };
// };

// /**
//  * 在cookies设置access token
//  * @param token
//  */
// const setAccessToken = async (token: string) => {
//     const options = getAccessTokenOptions(token);
//     await setCookie(options.name, token, omit(getAccessTokenOptions(token), ['name', 'value']));
// };

// /**
//  * 从请求头中获取token
//  * @param req 请求
//  */
// const getAccessTokenFromHeader = (req: any): string | null => {
//     const authHeader = req.headers.get?.('authorization');
//     if (authHeader?.startsWith('Bearer ')) {
//         return authHeader.substring(7);
//     }
//     return null;
// };

// /**
//  * 检测token的有效性(当前用户是否已登录)
//  */
// const checkAccessToken = async () => {
//     try {
//         const res = await fetchApi(async (c) => c.api.auth.profile.$get());
//         if (res.ok) {
//             const { result, data } = await res.json();
//             // 如果用户信息获取失败，则证明没有登录或令牌失效
//             if (!result || isNil(data)) {
//                 // 在客户端组件运行此函数会同时清除token
//                 await deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
//                 return null;
//             }
//             return data;
//         }
//         return null;
//         // eslint-disable-next-line unused-imports/no-unused-vars
//     } catch (error: any) {
//         // 服务器错误，删除access token
//         await deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
//         throw new Error('检测用户信息失败');
//     }
// };

// export {
//     ACCESS_TOKEN_COOKIE_NAME,
//     generateAccessToken,
//     setAccessToken,
//     getAccessTokenFromHeader,
//     checkAccessToken,
// };
