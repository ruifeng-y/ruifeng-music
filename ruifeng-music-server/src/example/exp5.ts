// src/example/exp5.ts
/**
 * 属性装饰器
属性装饰器一般不单独使用，主要用于配合类或方法装饰器进行组合装饰

参数
属性装饰器函数有两个参数： target

对于普通属性，target 就是当前对象的原型。也就是说，假设 Employee 是对象，那么 target 就是 Employee.prototype
对于静态属性，target 就是当前对象的类
propertyKey 属性的名称
 * 
 */
const userRoles: string[] = [];

// 通过属性装饰器把角色赋值给userRoles
const RoleDecorator = (roles: string[]) => (target: any, key: string) => {
    roles.forEach((role) => userRoles.push(role));
};

// 根据userRoles生成Roles对象并赋值给类原型的roles属性
const SetRoleDecorator = <
    T extends new (...args: any[]) => {
        [key: string]: any;
    },
    >(
    constructor: T,
) => {
    const roles = [
        { name: 'super-admin', desc: '超级管理员' },
        { name: 'admin', desc: '管理员' },
        { name: 'user', desc: '普通用户' },
    ];
    return class extends constructor {
        constructor(...args: any) {
            super(...args);
            this.roles = roles.filter((role) => userRoles.includes(role.name));
        }
    };
};

@SetRoleDecorator
class UserEntity {
    @RoleDecorator(['admin', 'user'])
    roles: string[] = [];
}

export const exp5 = () => {
    console.log();
    console.log(
        '-----------------------示例5:属性装饰器-----------------------',
    );
    console.log(
        '-----------------------使用装饰器根据权限过滤用户列表-----------------------',
    );
    console.log();
    const user = new UserEntity();
    console.log(user.roles);
    console.log();
    console.log('-----------------------示例5:执行完毕-----------------------');
};