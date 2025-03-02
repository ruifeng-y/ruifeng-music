import { BaseRepository } from '@/modules/database/base';
import { CustomRepository } from '@/modules/database/decorators';

import { UserEntity } from '../entities/user.entity';
/**
 * 存储类
查询用户名时默认简单地安装创建时间排序即可
 */
@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
    protected _qbName = 'user';

    buildBaseQB() {
        return this.createQueryBuilder(this.qbName)
            .orderBy(`${this.qbName}.createdAt`, 'DESC')
            .leftJoinAndSelect(`${this.qbName}.roles`, 'roles')
            .leftJoinAndSelect(`${this.qbName}.permissions`, 'permissions');
    }
}