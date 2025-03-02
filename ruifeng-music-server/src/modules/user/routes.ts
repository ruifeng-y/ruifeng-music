import { RouteOption, TagOption } from '../restful/types';

import * as controllers from './controllers';
import * as manageControllers from './controllers/manage';

/**
 * API路由
 * 为了更清晰的解耦（如果后续我们有需要可以自行在monorepo把每个模块单独发布到npm作为第三方模块），我们把路由API专门封装到一个函数内
 */

export const createUserApi = () => {
    const routes: Record<'app' | 'manage', RouteOption[]> = {
        app: [
            {
                name: 'app.user',
                path: 'user',
                controllers: Object.values(controllers),
            },
        ],
        manage: [
            {
                name: 'manage.user',
                path: 'user',
                controllers: Object.values(manageControllers),
            },
        ],
    };
    const tags: Record<'app' | 'manage', (string | TagOption)[]> = {
        app: [
            { name: '用户管理', description: '对用户进行CRUD操作' },
            { name: '账户操作', description: '注册登录、查看修改账户信息、修改密码等' },
        ],
        manage: [{ name: '用户管理', description: '管理用户信息' }],
    };
    return { routes, tags };
};