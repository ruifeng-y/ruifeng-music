import { AbilityOptions, AbilityTuple, MongoQuery, SubjectType } from '@casl/ability';
import { Injectable, InternalServerErrorException, OnApplicationBootstrap } from '@nestjs/common';
import { isNil, omit, isArray } from 'lodash';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import { deepMerge } from '@/modules/core/helpers';

import { Configure } from '../config/configure';
import { UserEntity } from '../user/entities';

import { SystemRoles } from './constants';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionType, Role } from './types'

/**
 * 代码定义了一个名为getSubject的泛型函数。它的目的是根据传入的参数类型，返回一个特定的值。下面是对这段代码的详细解释：
 * 实现原理：
 * 1、泛型函数：getSubject函数使用了泛型<S extends SubjectType>，这意味着它可以接受任何类型为SubjectType或其子类型的参数。
 * SubjectType是一个类型约束，确保传入的参数符合特定的结构或类型。
 * 2、参数类型检查：函数接受一个参数subject，类型为S。根据subject的类型，函数会返回不同的值。
 * 3、返回值：
 * 如果subject是一个字符串类型，函数直接返回这个字符串。
 * 如果subject对象具有modelName属性，函数返回这个对象的modelName属性。
 * 如果以上条件都不满足，函数返回subject对象的name属性。
 * @param subject 
 * @returns 
 */
const getSubject = <S extends SubjectType>(subject: S) => {
    if (typeof subject === 'string') return subject;
    if (subject.modelName) return subject;
    return subject.name;
};

@Injectable()
export class RbacResolver<A extends AbilityTuple = AbilityTuple, C extends MongoQuery = MongoQuery>
    implements OnApplicationBootstrap
{
    protected setuped = false;

    protected options: AbilityOptions<A, C>;

    protected _roles: Role[] = [
        {
            name: SystemRoles.USER,
            label: '普通用户',
            description: '新用户的默认角色',
            permissions: [],
        },
        {
            name: SystemRoles.SUPER_ADMIN,
            label: '超级管理员',
            description: '拥有整个系统的管理权限',
            permissions: [],
        },
    ];

    protected _permissions: PermissionType<A, C>[] = [
        {
            name: 'system-manage',
            label: '系统管理',
            description: '管理系统的所有功能',
            rule: {
                action: 'manage',
                subject: 'all',
            } as any,
        },
    ];

    constructor(
        protected dataSource: DataSource,
        protected configure: Configure,
    ) {}

    setOptions(options: AbilityOptions<A, C>) {
        if (!this.setuped) {
            this.options = options;
            this.setuped = true;
        }
        return this;
    }

    get roles() {
        return this._roles;
    }

    get permissions() {
        return this._permissions;
    }

    // 添加角色
    addRoles(data: Role[]) {
        // 将传入的角色数组与当前的角色数组进行合并
        this._roles = [...this.roles, ...data];
    }

    // 添加权限
    addPermissions(data: PermissionType<A, C>[]) {
        // 将传入的权限数组与已有的权限数组合并
        this._permissions = [...this.permissions, ...data].map((item) => {
            // 定义一个变量subject，类型为item.rule.subject
            let subject: typeof item.rule.subject;
            // 如果item.rule.subject是一个数组，则将数组中的每个元素通过getSubject函数获取subject
            if (isArray(item.rule.subject)) subject = item.rule.subject.map((v) => getSubject(v));
            // 否则，直接通过getSubject函数获取subject
            else subject = getSubject(item.rule.subject);
            // 将item.rule中的subject替换为获取到的subject
            const rule = { ...item.rule, subject };
            // 返回一个新的对象，包含item和替换后的rule
            return { ...item, rule };
        });
    }

    // 异步应用启动
    async onApplicationBootstrap() {
        // 如果数据源未初始化，则返回null
        if (!this.dataSource.isInitialized) return null;
        // 创建查询运行器
        const queryRunner = this.dataSource.createQueryRunner();

        // 连接查询运行器
        await queryRunner.connect();
        // 开始事务
        await queryRunner.startTransaction();

        try {
            // 同步角色
            await this.syncRoles(queryRunner.manager);
            // 同步权限
            await this.syncPermissions(queryRunner.manager);
            // 同步超级管理员
            await this.syncSuperAdmin(queryRunner.manager);
            // 提交事务
            await queryRunner.commitTransaction();
        } catch (err) {
            // 打印错误
            console.log(err);
            // 回滚事务
            await queryRunner.rollbackTransaction();
        } finally {
            // 释放查询运行器
            await queryRunner.release();
        }
        // 返回true
        return true;
    }
    /**
     * 同步角色
     * @param manager
     */
    async syncRoles(manager: EntityManager) {
        this._roles = this.roles.reduce((o, n) => {
            if (o.map(({ name }) => name).includes(n.name)) {
                return o.map((e) => (e.name === n.name ? deepMerge(e, n, 'merge') : e));
            }
            return [...o, n];
        }, []);
        for (const item of this.roles) {
            let role = await manager.findOne(RoleEntity, {
                relations: ['permissions'],
                where: {
                    name: item.name,
                },
            });

            if (isNil(role)) {
                role = await manager.save(
                    manager.create(RoleEntity, {
                        name: item.name,
                        label: item.label,
                        description: item.description,
                        systemed: true,
                    }),
                    {
                        reload: true,
                    },
                );
            } else {
                await manager.update(RoleEntity, role.id, { systemed: true });
            }
        }

        // 清理已经不存在的系统角色
        const systemRoles = await manager.findBy(RoleEntity, { systemed: true });
        const toDels: string[] = [];
        for (const sRole of systemRoles) {
            if (isNil(this.roles.find(({ name }) => sRole.name === name))) toDels.push(sRole.id);
        }
        if (toDels.length > 0) await manager.delete(RoleEntity, toDels);
    }

    /**
     * 同步权限
     * @param manager
     */
    async syncPermissions(manager: EntityManager) {
        const permissions = await manager.find(PermissionEntity);
        const roles = await manager.find(RoleEntity, {
            relations: ['permissions'],
            where: { name: Not(SystemRoles.SUPER_ADMIN) },
        });
        const roleRepo = manager.getRepository(RoleEntity);
        // 合并并去除重复权限
        this._permissions = this.permissions.reduce(
            (o, n) => (o.map(({ name }) => name).includes(n.name) ? o : [...o, n]),
            [],
        );
        const names = this.permissions.map(({ name }) => name);

        /** *********** 同步权限  ************ */

        for (const item of this.permissions) {
            const permission = omit(item, ['conditions']);
            const old = await manager.findOneBy(PermissionEntity, {
                name: permission.name,
            });
            if (isNil(old)) {
                await manager.save(manager.create(PermissionEntity, permission));
            } else {
                await manager.update(PermissionEntity, old.id, permission);
            }
        }

        // 删除冗余权限
        const toDels: string[] = [];
        for (const item of permissions) {
            if (!names.includes(item.name) && item.name !== 'system-manage') toDels.push(item.id);
        }
        if (toDels.length > 0) await manager.delete(PermissionEntity, toDels);

        /** *********** 同步普通角色  ************ */
        for (const role of roles) {
            const rolePermissions = await manager.findBy(PermissionEntity, {
                name: In(this.roles.find(({ name }) => name === role.name).permissions),
            });
            await roleRepo
                .createQueryBuilder('role')
                .relation(RoleEntity, 'permissions')
                .of(role)
                .addAndRemove(
                    rolePermissions.map(({ id }) => id),
                    (role.permissions ?? []).map(({ id }) => id),
                );
        }

        /** *********** 同步超级管理员角色  ************ */

        // 查询出超级管理员角色
        const superRole = await manager.findOneOrFail(RoleEntity, {
            relations: ['permissions'],
            where: { name: SystemRoles.SUPER_ADMIN },
        });

        const systemManage = await manager.findOneOrFail(PermissionEntity, {
            where: { name: 'system-manage' },
        });
        // 添加系统管理权限到超级管理员角色
        await roleRepo
            .createQueryBuilder('role')
            .relation(RoleEntity, 'permissions')
            .of(superRole)
            .addAndRemove(
                [systemManage.id],
                (superRole.permissions ?? []).map(({ id }) => id),
            );
    }

    /**
     * 同步超级管理员
     * @param manager
     */
    async syncSuperAdmin(manager: EntityManager) {
        const superRole = await manager.findOneOrFail(RoleEntity, {
            relations: ['permissions'],
            where: { name: SystemRoles.SUPER_ADMIN },
        });

        const superUsers = await manager
            .createQueryBuilder(UserEntity, 'user')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('roles.id IN (:...ids)', { ids: [superRole.id] })
            .getMany();
        if (superUsers.length < 1) {
            const userRepo = manager.getRepository(UserEntity);
            if ((await userRepo.count()) < 1) {
                throw new InternalServerErrorException(
                    'Please add a super-admin user first before run server!',
                );
            }
            const firstUser = await userRepo.findOneByOrFail({ id: undefined });
            await userRepo
                .createQueryBuilder('user')
                .relation(UserEntity, 'roles')
                .of(firstUser)
                .addAndRemove(
                    [superRole.id],
                    ((firstUser.roles ?? []) as RoleEntity[]).map(({ id }) => id),
                );
        }
    }
}