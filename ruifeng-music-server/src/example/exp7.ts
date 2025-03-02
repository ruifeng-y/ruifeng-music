// src/example/exp7.ts
/*
参数装饰器
一个类中每个方法的参数也可以有自己的装饰器。

与属性装饰器类似，参数装饰器一般不单独使用，而是配合类或方法装饰器组合使用

参数
target 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
key 方法名称
index 参数数组中的位置
比如我们需要格式化一个方法的参数，那么可以创建一个专门用于格式化的装饰器

展开法
与赋值法类似，只不过使用ES6+的展开语法，更容易理解和使用，例如


*/
// 参数格式化配置
const parseConf: ((...args: any[]) => any)[] = [];

// 参数装饰器
// 装饰器工厂：parse 是一个装饰器工厂函数，它接受一个参数 parseTo，这个参数是一个函数，用于解析参数。装饰器工厂函数返回一个实际的装饰器函数。
export const parse =(parseTo: (...args: any[]) => any) =>
    (target: any, propertyName: string, index: number) => {
        parseConf[index] = parseTo;
    };

// 在函数调用前执行格式化操作
// 方法装饰器
export const parseDecorator = (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
): PropertyDescriptor => {
    console.log('开始格式化数据');
    return {
        ...descriptor,
        value(...args: any[]) {
            // 获取格式化后的参数列表
            const newArgs = args.map((v, i) =>
                parseConf[i] ? parseConf[i](v) : v,
            );
            console.log('格式化完毕');
            return descriptor.value.apply(this, newArgs);
        },
    };
};

// 用户类型接口
export interface UserType {
    id: number;
    username: string;
}

// 用户服务类
class UserService {
    private users: UserType[] = [
        { id: 1, username: 'admin' },
        { id: 2, username: 'pincman' },
    ];

    // 获取用户列表
    getUsers() {
        return this.users;
    }

    // 删除用户
    @parseDecorator
    delete(@parse((arg: any) => Number(arg)) id: number) {
        this.users = this.users.filter((userObj) => userObj.id !== id);
        return this;
    }
}

// 示例7
export const exp7 = () => {
    console.log();
    console.log(
        '-----------------------示例7:参数装饰器-----------------------',
    );
    console.log('-----------------------格式化参数-----------------------');
    console.log();
    const userService = new UserService();
    userService.delete(1);
    console.log(userService.getUsers());
    console.log();
    console.log('-----------------------示例7:执行完毕-----------------------');
};