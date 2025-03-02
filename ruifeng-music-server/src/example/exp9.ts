// src/example/exp9.ts
import 'reflect-metadata';

class Point {
    x: number;

    y: number;
}

class Line {
    private _p0: Point;

    private _p1: Point;

    @validate
     // 需要加上下面这行，因为新版reflect-metadata不再支持预定义元数据
    @Reflect.metadata('design:type', Point)
    set p0(value: Point) {
        this._p0 = value;
    }

    get p0() {
        return this._p0;
    }

    @validate
    // 需要加上下面这行，因为新版reflect-metadata不再支持预定义元数据
    @Reflect.metadata('design:type', Point)
    set p1(value: Point) {
        this._p1 = value;
    }

    get p1() {
        return this._p1;
    }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    const set = descriptor.set!;
    // eslint-disable-next-line func-names
    descriptor.set = function (value: T) {
        const type = Reflect.getMetadata('design:type', target, propertyKey);

        if (!(value instanceof type)) {
            throw new TypeError('Invalid type.');
        }
        set.apply(this, [value]);
    };
    return descriptor;
}

export const exp9 = () => {
    console.log();
    console.log('-----------------------示例9:基本元元素类型反射-----------------------');
    console.log('-----------------------为访问器的set方法添加类型验证-----------------------');
    console.log();
    const line = new Line();
    const p0 = new Point();
    p0.x = 1;
    p0.y = 2;
    line.p1 = p0;
    console.log(line);
    console.log();
    console.log('-----------------------示例9:执行完毕-----------------------');
};
