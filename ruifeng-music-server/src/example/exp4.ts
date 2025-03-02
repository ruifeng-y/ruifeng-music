
// src/example/exp4.ts
// 对类原型链 prototype 上的属性或者方法和类本身的静态属性和方法进行赋值或重载操作，还可以重载构造函数
/*
原型法
一般用于类装饰器上重载构造函数以及添加属性或方法，例如：
*/
type UserProfile = Record<string, any> & {
    phone?: number;
    address?: string;
};

// 定义一个装饰器函数，接收一个 UserProfile 类型的参数
const ProfileDecorator = (profile: UserProfile) => (target: any) => {
    // 保存原始类
    const Original = target;
    let userinfo = '';
    // 遍历 profile 对象的属性
    Object.keys(profile).forEach((key) => {
        userinfo = `${userinfo}.${profile[key].toString()}`;
    });
    // 添加一个原型属性
    Original.prototype.userinfo = userinfo;
    // 使用函数创建一个新的类(类构造器),返回值为传入类的对象,这样就重载了构造函数
    function constructor(...args: any[]) {
        console.log('contruct has been changed');
        return new Original(...args);
    }
    // 赋值原型链
    constructor.prototype = Original.prototype;
    // 添加一个静态属性
    constructor.myinfo = `myinfo ${userinfo}`;
    return constructor as typeof Original;
};

// 因为静态属性是无法通过[key: string]: any;获取类型提示的,所以这里添加一个接口用于动态各类添加静态属性
interface StaticUser {
    new (): UserProfile;
    myinfo: string;
}

// 使用装饰器对 ProfileService 类进行装饰
@ProfileDecorator({ phone: 133, address: 'zhejiang' })
class ProfileService {}

// 导出一个函数，用于执行示例
export const exp4 = () => {
    console.log();
    console.log(
        '-----------------------示例4:修类的构造函数,原型属性,静态属性等-----------------------',
    );
    console.log(
        '-----------------------设置原型属性值,重载构造方法,添加静态属性-----------------------',
    );
    console.log();
    // 打印静态属性
    console.log((ProfileService as unknown as StaticUser).myinfo);
    // 创建 ProfileService 类的实例
    const profile = new ProfileService();
    // 打印原型属性
    console.log((profile as any).userinfo);
    console.log();
    console.log('-----------------------示例4:执行完毕-----------------------');
};