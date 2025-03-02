import instance from './request';

export const get = (url: string, params?: any) => {
    return instance.get(url, { params });
}