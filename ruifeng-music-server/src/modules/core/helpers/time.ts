// src/modules/core/helpers/time.ts
import dayjs from 'dayjs';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import localeData from 'dayjs/plugin/localeData';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { Configure } from '@/modules/config/configure';

import { AppConfig, TimeOptions } from '../types';

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

/**
 * 获取一个dayjs时间对象
 * 从传入的选项参数中获取必要的属性
 * 获取应用配置中的默认时区及语言相关配置
 * 克隆一个新的dayjs对象
 * 返回该对象并设置时区
 * @param configure
 * @param options
 */
export const getTime = async (configure: Configure, options?: TimeOptions) => {
    const { date, format, locale, strict, zonetime } = options ?? {};
    const config = await configure.get<AppConfig>('app');
    // 每次创建一个新的时间对象
    // 如果没有传入local或timezone则使用应用配置
    const now = dayjs(date, format, locale ?? config.locale, strict).clone();
    return now.tz(zonetime ?? config.timezone);
};