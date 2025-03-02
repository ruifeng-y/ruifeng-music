
import { SetMetadata } from '@nestjs/common';

import { ALLOW_GUEST } from '../constants';
/**
 * 匿名端点装饰器
 * Guest装饰器用于装饰一些可不登录匿名访问的接口（控制器方法）
 * 我们会把下面的JWT添加到全局，默认所有接口都需要登录后访问，所以对于一些不需要登录即可访问的接口添加这个装饰器
 * @returns 
 */
export const Guest = () => SetMetadata(ALLOW_GUEST, true);