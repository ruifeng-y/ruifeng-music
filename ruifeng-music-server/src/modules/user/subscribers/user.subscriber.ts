import { randomBytes } from 'crypto';

import { EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

import { BaseSubscriber } from '@/modules/database/base';

import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { UserEntity } from '../entities/user.entity';
import { encrypt } from '../helpers';

/**
 * 用户模型监听器
 */
@EventSubscriber()
export class UserSubscriber extends BaseSubscriber<UserEntity> {
    protected entity = UserEntity;

    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            where: { username },
        });
        return !user ? username : this.generateUserName(event);
    }

    /**
     * 在插入事件之前执行
     * @param event 插入事件
     */
    async beforeInsert(event: InsertEvent<UserEntity>) {
        //在插入数据之前先判断用户有无设置用户名，如没有设置，则使用generateUserName方法生成一个随机用户名
        // 为了保证用户名的唯一性，generateUserName会检测随机生成的用户名是否已经被占用，如果占用在递归生成一个新的，直到生成出来的用户名没有被占用为止
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }
        // 在插入数据之前先判断用户有无设置密码，如没有设置，则生成一个随机密码
        if (!event.entity.password) {
            event.entity.password = randomBytes(11).toString('hex').slice(0, 22);
        }
        // 在插入数据库之前使用encrypt函数对密码进行加密
        event.entity.password = await encrypt(this.configure, event.entity.password);
    }

    /**
     * beforeUpdate目前用于在用户更新密码时，对新密码使用encrypt函数加密
     * @param event 
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(this.configure, event.entity.password);
        }
    }

    async afterLoad(entity: UserEntity): Promise<void> {
        let permissions = (entity.permissions ?? []) as PermissionEntity[];
        for (const role of entity.roles ?? []) {
            const roleEntity = await RoleEntity.findOneOrFail({
                relations: ['permissions'],
                where: { id: role.id },
            });
            permissions = [...permissions, ...(roleEntity.permissions ?? [])];
        }
        entity.permissions = permissions.reduce((o, n) => {
            if (o.find(({ name }) => name === n.name)) return o;
            return [...o, n];
        }, []);
    }
}