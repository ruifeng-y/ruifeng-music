// src/example/exp8.ts
/** 
 * 访问器装饰器
访问器其实只是那些添加了get,set前缀的方法，用于使用调用属性的方式获取和设置一些属性的方法，类似于PHP中的魔术方法__get,__set。
其装饰器使用方法与普通方法并无差异，只是在获取值的时候是调用描述符的get和set来替代value而已。 
例如，我们添加一个_nickname_字段，给设置_nickname_添加一个自定义前缀，并禁止在遍历_user_对象时出现_nickname_的值，添加一个_fullname_字段，
在设置_nickname_时添加一个字符串后缀生成。
 */
export const HiddenDecorator = () => {
    return (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor,
    ) => {
        descriptor.enumerable = false;
    };
};

export const PrefixDecorator = (prefix: string) => {
    return (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor,
    ) => {
        return {
            ...descriptor,
            set(value: string) {
                descriptor.set.apply(this, [`${prefix}_${value}`]);
            },
        };
    };
};

export class UserEntity {
    private _nickname: string;

    // @ts-ignore
    private fullname: string;

    @HiddenDecorator()
    @PrefixDecorator('jesse_')
    get nickname() {
        return this._nickname;
    }

    set nickname(value: string) {
        this._nickname = value;
        this.fullname = `${value}_fullname`;
    }
}

export const exp8 = () => {
    // ...

    console.log();
    console.log(
        '-----------------------示例8:get/set装饰器-----------------------',
    );
    console.log(
        '-----------------------禁止nickname出现在遍历中,为nickname添加前缀-----------------------',
    );
    console.log();
    const user = new UserEntity();

    user.nickname = 'pincman';
    console.log(user);
    console.log(user.nickname);
    console.log();
    console.log('-----------------------示例8:执行完毕-----------------------');
};