import { Injectable } from '@nestjs/common';
import { EntityNotFoundError, SelectQueryBuilder, DataSource } from 'typeorm';

import { Configure } from '@/modules/config/configure';
import { BaseService } from '@/modules/database/base';
import { QueryHook } from '@/modules/database/types';

import { SystemRoles } from '@/modules/rbac/constants';
// import { RoleRepository } from '@/modules/rbac/repositories';

import { CreateUserDto, QueryUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { isArray, isNil } from 'lodash';
import { RoleRepository } from '@/modules/rbac/repositories';
/**
 * 用户管理服务
 */
@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
    // 这是一个类级别的属性，表示是否启用“垃圾箱”功能。具体用途可能是在删除操作时，将数据移动到“垃圾箱”而不是直接删除，以便于恢复。
    protected enable_trash = true;

    constructor(
        // 这些参数都被标记为protected，这意味着它们只能在类的内部和继承的子类中访问。
        protected configure: Configure,
        protected dataSource: DataSource,
        protected userRepository: UserRepository,
        protected roleRepository: RoleRepository,
    ) {
        // 调用父类BaseService的构造函数，并将userRepository作为参数传递给它。
        // 这允许UserService使用BaseService提供的功能，同时与特定的UserRepository实例交互。
        super(userRepository);
    }

    /**
     * 创建用户
     * @param data
     */
    // async create(data: CreateUserDto) {
    //     const user = await this.userRepository.save(data, { reload: true });
    //     return this.detail(user.id);
    // }

    async create({ roles, permissions, ...data }: CreateUserDto) {
        const user = await this.userRepository.save(data, { reload: true });
        if (isArray(roles) && roles.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('roles')
                .of(user)
                .add(roles);
        }
        if (isArray(permissions) && permissions.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('permissions')
                .of(user)
                .add(permissions);
        }
        await this.addUserRole(await this.detail(user.id));
        return this.detail(user.id);
    }

    /**
     * 更新用户
     * @param data
     */
    // async update(data: UpdateUserDto) {
    //     const updated = await this.userRepository.save(data, { reload: true });
    //     const user = await this.detail(updated.id);
    //     return this.detail(user.id);
    // }

    async update({ roles, permissions, ...data }: UpdateUserDto) {
        const updated = await this.userRepository.save(data, { reload: true });
        const user = await this.detail(updated.id);
        if ((isNil(roles) || roles.length < 0) && (isNil(permissions) || permissions.length < 0))
            return user;
        if (isArray(roles) && roles.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('roles')
                .of(user)
                .addAndRemove(roles, user.roles ?? []);
        }
        if (isArray(permissions) && permissions.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('permissions')
                .of(user)
                .addAndRemove(permissions, user.permissions ?? []);
        }
        await this.addUserRole(await this.detail(user.id));
        return this.detail(user.id);
    }

    /**
     * 根据用户用户凭证查询用户
     * @param credential
     * @param callback
     */
    async findOneByCredential(credential: string, callback?: QueryHook<UserEntity>) {
        // 构建基础查询
        let query = this.userRepository.buildBaseQB();
        // 如果有回调函数，则执行回调函数
        if (callback) {
            query = await callback(query);
        }
        // 根据用户凭证查询用户
        return query
            .where('user.username = :credential', { credential })
            .orWhere('user.email = :credential', { credential })
            .orWhere('user.phone = :credential', { credential })
            .getOne();
    }

    /**
     * 根据对象条件查找用户,不存在则抛出异常
     * @param condition 一个对象，包含用于查找用户的条件。每个键值对表示一个查询条件。
     * @param callback 一个可选的回调函数，用于进一步自定义查询。这个回调函数接收一个查询对象，并返回一个修改后的查询对象。
     */
    async findOneByCondition(condition: { [key: string]: any }, callback?: QueryHook<UserEntity>) {
        // 这行代码调用userRepository的buildBaseQB方法，构建一个基础查询对象query。
        let query = this.userRepository.buildBaseQB();
        if (callback) {
            query = await callback(query);
        }
        // 这段代码将condition对象转换为一个键值对数组，然后使用Object.fromEntries方法将其转换回对象。这个对象wheres将用于构建查询条件。
        const wheres = Object.fromEntries(
            Object.entries(condition).map(([key, value]) => [key, value]),
        );
        const user = query.where(wheres).getOne();
        if (!user) {
            throw new EntityNotFoundError(UserEntity, Object.keys(condition).join(','));
        }
        return user;
    }

    protected async buildListQB(
        // 一个SelectQueryBuilder<UserEntity>类型的对象，用于构建查询。
        queryBuilder: SelectQueryBuilder<UserEntity>,
        // 一个QueryUserDto类型的对象，包含查询选项。例如，分页、排序和过滤选项。
        options: QueryUserDto,
        // 一个可选的QueryHook<UserEntity>类型的回调函数，用于在构建查询时进行额外的处理。
        callback?: QueryHook<UserEntity>,
    ) {
        // 从options对象中提取orderBy属性。
        const { orderBy } = options;
        const qb = await super.buildListQB(queryBuilder, options, callback);
        if (!isNil(options.role)) {
            qb.andWhere('roles.id IN (:...roles)', {
                roles: [options.role],
            });
        }
        if (!isNil(options.permission)) {
            qb.andWhere('permissions.id IN (:...permissions)', {
                permissions: [options.permission],
            });
        }
        if (isNil(orderBy)) qb.orderBy(`${this.repository.qbName}.${orderBy}`, 'ASC');
        return qb;
    }

    protected async addUserRole(user: UserEntity) {
        const roleRelation = this.userRepository.createQueryBuilder().relation('roles').of(user);
        const roleNames = (user.roles ?? []).map(({ name }) => name);
        const noneUserRole = roleNames.length <= 0 || !roleNames.includes(SystemRoles.USER);
        if (noneUserRole) {
            const userRole = await this.roleRepository.findOne({
                relations: ['users'],
                where: { name: SystemRoles.USER },
            });
            if (!isNil(userRole)) await roleRelation.add(userRole);
        }
    }
}