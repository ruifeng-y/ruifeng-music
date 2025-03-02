// import { SerializeOptions as CookieSerializeOptions } from 'cookie';
// import {
//     deleteCookie as deleteClientCookie,
//     getCookie as getClientCookie,
//     getCookies as getClientCookies,
//     hasCookie as hasClientCookie,
//     setCookie as setClientCookie,
// } from 'cookies-next';

// /**
//  * 获取所有cookies
//  * @param options
//  */
// export const getCookies = async (options?: CookieSerializeOptions) => {
//     if (typeof window === 'undefined') {
//         const { cookies } = await import('next/headers');
//         return (await cookies()).getAll();
//     }
//     return getClientCookies(options);
// };

// /**
//  * 判断cookie是否存在
//  * @param key
//  * @param options
//  */
// export const hasCookie = async (key: string, options?: CookieSerializeOptions) => {
//     if (typeof window === 'undefined') {
//         const { cookies } = await import('next/headers');
//         return (await cookies()).has(key);
//     }
//     return hasClientCookie(key, options);
// };

// /**
//  * 获取cookie
//  * @param key
//  * @param options
//  */
// export const getCookie = async (key: string, options?: CookieSerializeOptions) => {
//     if (typeof window === 'undefined') {
//         const { cookies } = await import('next/headers');
//         return (await cookies()).get(key)?.value;
//     }
//     return getClientCookie(key, options);
// };

// /**
//  * 设置cookie
//  * @param key
//  * @param value
//  * @param options
//  */
// export const setCookie = async (key: string, value: string, options?: CookieSerializeOptions) => {
//     if (typeof window !== 'undefined') setClientCookie(key, value, options);
// };

// /**
//  * 删除cookie
//  * @param key
//  * @param options
//  */
// export const deleteCookie = async (key: string, options?: CookieSerializeOptions) => {
//     if (typeof window !== 'undefined') deleteClientCookie(key, options);
// };
