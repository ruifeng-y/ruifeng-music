import { Module, ModuleMetadata, Type } from '@nestjs/common';
import deepmerge from 'deepmerge';
import { isNil } from 'lodash';


/**
 * 用于请求验证中的boolean数据转义
 * @param value/categories
 */
export function toBoolean(value?: string | boolean): boolean {
    // 判断value是否为空
    if (isNil(value)) return false;
    // 判断value是否为boolean类型
    if (typeof value === 'boolean') return value;
    // 尝试将value转换为boolean类型
    try {
        return JSON.parse(value.toLowerCase());
    } catch (error) {
        // 如果转换失败，则将value转换为boolean类型
        return value as unknown as boolean;
    }
}

/**
 * 用于请求验证中转义null
 * @param value
 */
export function toNull(value?: string | null): string | null | undefined {
    return value === 'null' ? null : value;
}

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

/**
 * 判断一个函数是否为异步函数
 * @param callback
 */
export function isAsyncFn<R, A extends Array<any>>(
    callback: (...asgs: A) => Promise<R> | R,
): callback is (...asgs: A) => Promise<R> {
    const AsyncFunction = (async () => {}).constructor;
    return callback instanceof AsyncFunction === true;
}

/**
 * 手动动态创建一个模块
 * @param target
 * @param metaSetter
 */
export function CreateModule(
    target: string | Type<any>,
    metaSetter: () => ModuleMetadata = () => ({}),
): Type<any> {
    let ModuleClass: Type<any>;
    if (typeof target === 'string') {
        ModuleClass = class {};
        Object.defineProperty(ModuleClass, 'name', { value: target });
    } else {
        ModuleClass = target;
    }
    Module(metaSetter())(ModuleClass);
    return ModuleClass;
}

/**
 * 生成只包含字母的固定长度的字符串
 * @param length
 */
export const getRandomCharString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};


/**
 * 获取小于N的随机整数
 * @param count
 */
export const getRandomIndex = (count: number) => Math.floor(Math.random() * count);

/**
 * 从列表中获取一个随机项
 * @param list
 */
export const getRandItemData = <T extends Record<string, any>>(list: T[]) => {
    return list[getRandomIndex(list.length)];
};

/**
 * 从列表中获取多个随机项组成一个新列表
 * @param list
 */
export const getRandListData = <T extends Record<string, any>>(list: T[]) => {
    const result: T[] = [];
    for (let i = 0; i < getRandomIndex(list.length); i++) {
        const random = getRandItemData<T>(list);
        if (!result.find((item) => item.id === random.id)) {
            result.push(random);
        }
    }
    return result;
};