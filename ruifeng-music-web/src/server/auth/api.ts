// import { isNil } from 'lodash';

// import { generateAccessToken } from '@/libs/token';

// import { createErrorResult, createHonoApp } from '../common/utils';

// import { authRoutes } from './routes';
// import { getUser } from './service';
// import { AuthItem } from './types';
// import { addTokenToBlacklist, createAuthenticatedHandler, passport, verifyJWT } from './utils';

// const app = createHonoApp();

// export const authApi = app
//     .openapi(authRoutes.profileRoute, async (c) => {
//         try {
//             const isAuthenticated = await verifyJWT(c);
//             if (!isAuthenticated) return c.json({ result: false, data: null }, 200);
//             const { id } = (c.req as any).user as AuthItem;
//             const user = await getUser(id);
//             if (isNil(user)) return c.json({ result: false, data: null }, 200);
//             return c.json({ result: true, data: user }, 200);
//         } catch (error) {
//             return c.json(createErrorResult('获取用户失败', error), 500);
//         }
//     })
//     .openapi(authRoutes.loginRoute, async (c) => {
//         const body = await c.req.json();

//         // 手动构建认证请求
//         const authReq = {
//             ...c.req.raw,
//             body,
//         };
//         return new Promise((resolve) => {
//             passport.authenticate('local', (err: any, user: AuthItem, _info: any) => {
//                 if (err)
//                     return err.code === 401
//                         ? resolve(c.json(createErrorResult('认证失败', err.message), 401))
//                         : resolve(c.json(createErrorResult('服务器错误', err), 500));
//                 const token = generateAccessToken(user);
//                 return resolve(c.json({ token }, 200));
//             })(authReq, (c.res as any).raw);
//         });
//     })
//     .openapi(
//         authRoutes.logoutRoute,
//         createAuthenticatedHandler(async (c) => {
//             try {
//                 const { id } = (c.req as any).user as AuthItem;
//                 const success = await addTokenToBlacklist(id);
//                 // 注意：这里直接返回200就行了。因为反正你是退出成功还是token失效，前端都是跳转到登录页，没有什么区别
//                 if (!success) return c.json(createErrorResult('用户未登录'), 200);
//                 return c.json({ message: '登出成功' }, 200);
//             } catch (error) {
//                 return c.json(createErrorResult('登出失败', error), 500);
//             }
//         }),
//     );
