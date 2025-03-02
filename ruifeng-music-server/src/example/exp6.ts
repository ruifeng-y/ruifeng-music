// src/example/exp6.ts
/* 
方法装饰器
在一开始我们介绍了装饰器的原理，其实这就是方法装饰器的原始实现。与属性装饰器不同的是，方法装饰器接受三个参数

方法装饰器重载的时候需要注意的一点是定义 value 务必使用 function，而不是箭头函数。因为我们在调用原始的旧方法使用会使用到 this，如：method.apply(this, args)，这里的 this 指向需要 function 来定义。

参数
target 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。 key 方法名称 descriptor: PropertyDescriptor 方法的属性描述符（最重要的参数）

属性描述符
属性描述包含以下几个属性

configurable?: boolean; 能否使用delete、能否修改方法特性或修改访问器属性
enumerable?: boolean; 是否在遍历对象的时候存在
value?: any; 用于定义新的方法代替旧方法
writable?: boolean; 是否可写
get?(): any; 访问器
set?(v: any): void; 访问器
接下来我们使用方法装饰器修改一开始的装饰器原理中的登录日志记录器

赋值法
一般用于方法装饰器上修改某个描述符，例如

*/
const loggerDecorator = () => {
    return function logMethod(
        target: any,
        propertyName: string,
        propertyDescriptor: PropertyDescriptor,
    ): PropertyDescriptor {
        const method = propertyDescriptor.value;

        // 重载方法
        propertyDescriptor.value = function async(...args: any[]) {
            try {
                return method.apply(this, args); // 调用之前的函数
            } finally {
                const now = new Date().valueOf();
                console.log(`lasted logged in ${now}`);
            }
        };
        return propertyDescriptor;
    };
};

class UserService {
    @loggerDecorator()
    async login() {
        console.log('login success');
        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }
}

export const exp6 = () => {
    console.log();
    console.log(
        '-----------------------示例6:方法装饰器-----------------------',
    );
    console.log(
        '-----------------------使用装饰器重写示例1-----------------------',
    );
    console.log();
    const user = new UserService();
    user.login();
    console.log();
    console.log('-----------------------示例6:执行完毕-----------------------');
};