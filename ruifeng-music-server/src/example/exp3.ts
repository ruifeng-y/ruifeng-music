// src/example/exp3.ts
// 定义一个装饰器工厂函数，接受两个参数，返回一个装饰器函数
const SetNameDecorator = (firstname: string, lastname: string) => {
    // 将参数拼接成字符串
    const name = `${firstname}.${lastname}`;
    // 返回一个装饰器函数，接受一个构造函数作为参数
    return <T extends new (...args: any[]) => any>(target: T) => {
        // 返回一个新的类，继承自传入的构造函数
        return class extends target {
            // 在新类中定义一个私有属性_name，值为拼接后的字符串
            _name: string = name;

            // 定义一个方法，返回_name属性的值
            getMyName() {
                return this._name;
            }
        };
    };
};

// 使用装饰器工厂函数，传入参数，对UserService类进行装饰
@SetNameDecorator('jesse', 'pincman')
class UserService {
     // 定义一个索引签名，表示该类可以接受任意数量的属性
     [key: string]: any;
     // 定义一个方法c
     c() {}
}

// 导出一个函数exp3，用于执行示例3
export const exp3 = () => {
    console.log();
    console.log(
        '-----------------------示例3:装饰器工厂-----------------------',
    );
    console.log(
        '-----------------------通过继承方式 重载getName方法-----------------------',
    );
    console.log();
    // 创建UserService类的实例
    const user = new UserService();
    // 调用实例的getMyName方法，并打印结果
    console.log(user.getMyName());
    console.log();
    console.log('-----------------------示例3:执行完毕-----------------------');
};