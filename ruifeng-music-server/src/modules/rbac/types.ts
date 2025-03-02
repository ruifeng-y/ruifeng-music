import { AbilityTuple, MongoAbility, MongoQuery, RawRuleFrom } from '@casl/ability';
import { ModuleRef } from '@nestjs/core';
import { FastifyRequest as Request } from 'fastify';

import { UserEntity } from '../user/entities/user.entity';

import { UserRepository } from '../user/repositories/user.repository';

import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RbacResolver } from './rbac.resolver';
/**
 * 定义了一个名为Role的类型，它结合了ClassToPlain<RoleEntity>类型中的一些属性，并添加了一个新的属性permissions。
 * 具体来说，这段代码的作用和实现原理如下：
 *
 * 实现原理:
 * 1、Pick工具类型：Pick是TypeScript中的一个工具类型，用于从给定的类型中选择一些属性。
 * 在这里，Pick<ClassToPlain<RoleEntity>, 'name' | 'label' | 'description'>表示从ClassToPlain<RoleEntity>类型中选择name、
 * label和description这三个属性。
 * 2、交叉类型：&符号用于创建交叉类型，即同时包含多个类型的所有属性。
 * 在这里，Pick<ClassToPlain<RoleEntity>, 'name' | 'label' | 'description'> & { permissions: string[]; }
 * 表示Role类型不仅包含ClassToPlain<RoleEntity>中的name、label和description属性，还包含一个名为permissions的属性，该属性是一个字符串数组。
 * 
 * 用途：这段代码的用途是定义一个Role类型，它代表一个角色，包含角色的名称、标签、描述以及该角色所拥有的权限列表。
 * 这种类型定义通常用于数据传输对象（DTOs）、API响应或前端状态管理中，以确保角色对象具有特定的结构和属性。
 * 
 */
export type Role = Pick<ClassToPlain<RoleEntity>, 'name' | 'label' | 'description'> & {
    permissions: string[];
};

export type PermissionType<A extends AbilityTuple, C extends MongoQuery> = Pick<
    ClassToPlain<PermissionEntity<A, C>>,
    'name'
> &
    Partial<Pick<ClassToPlain<PermissionEntity<A, C>>, 'label' | 'description'>> & {
        rule: Omit<RawRuleFrom<A, C>, 'conditions'> & {
            conditions?: (user: ClassToPlain<UserEntity>) => Record<string, any>;
        };
    };

/**
 * 代码定义了一个名为PermissionChecker的类型，它是一个函数类型。这个函数接受三个参数，并返回一个Promise对象，该Promise对象解析为一个布尔值。
 * 函数名和类型：
 * PermissionChecker：这是函数类型的名称，表示这个类型定义了一个函数，用于检查权限。
 * 参数：
 * ability: MongoAbility：第一个参数ability的类型是MongoAbility。MongoAbility可能是一个接口或类型，用于表示用户的权限或能力。这个参数通常包含用户可以执行的操作或访问的资源信息。
 * ref?: 
 * ModuleRef：第二个参数ref是可选的，类型是ModuleRef。ModuleRef可能是一个类或接口，用于引用模块或服务。这个参数可能用于获取模块或服务的实例，以便在权限检查过程中使用
 * request?: Request：第三个参数request也是可选的，类型是Request。Request可能是一个类或接口，用于表示HTTP请求。这个参数可能用于获取请求信息，例如请求的URL、请求头、请求体等，以便在权限检查过程中使用。
 * 返回值：函数返回一个Promise对象，该Promise对象解析为一个布尔值。这个布尔值表示权限检查的结果，如果为true，表示用户具有指定的权限；如果为false，表示用户不具有指定的权限。
 * 用途：
 * PermissionChecker类型定义了一个用于权限检查的函数。这种函数通常用于在应用程序中实现访问控制，确保只有具有适当权限的用户才能执行特定的操作或访问特定的资源。
 * 
 */
export type PermissionChecker = (
    ability: MongoAbility,
    ref?: ModuleRef,
    request?: Request,
) => Promise<boolean>;

export type CheckerParams = {
    resolver: RbacResolver;
    repository: UserRepository;
    checkers: PermissionChecker[];
    moduleRef?: ModuleRef;
    request?: any;
};