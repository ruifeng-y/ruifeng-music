
import { Depends } from '@/modules/restful/decorators';

import { Guest } from '../decorators';
import { UserService } from '../services';
import { UserModule } from '../user.module';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CreateUserDto, UpdateUserDto } from '../dtos';

import { DeleteWithTrashDto, RestoreDto } from '@/modules/restful/dtos';
import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe, Query, SerializeOptions, Post, Body, Patch, Delete } from '@nestjs/common';
import { FrontendQueryUserDto } from '../dtos';
import { SelectTrashMode } from '@/modules/database/constants';
import { IsNull, Not } from 'typeorm';

/**
 * 控制器
 * 1、于允许匿名访问的API请加上@Guest装饰器
 * 2、对于必须登录后访问的API请加上@ApiBearerAuth装饰器，如果整个控制器的所有方法都是必须登录后访问的，
 * 那么只需要在控制器上加上@ApiBearerAuth装饰器即可，这个装饰器的作用在于openapi(swagger)给API展示出一个必须登录后访问的锁图标
 * 3、为AuthController.login方法添加上本地守卫@UseGuards(LocalAuthGuard)
 * 4、@ReqUser() user用于获取当前用户
 */
@ApiTags('用户查询')
@Depends(UserModule)
@Controller('users')
export class UserController {
    constructor(protected service: UserService) {}

    /**
     * 用户列表
     */
    @Get()
    @Guest()
    @SerializeOptions({ groups: ['user-list'] })
    async list(
        @Query()
        options: FrontendQueryUserDto,
    ) {
        return this.service.list({
            ...options,
            trashed: SelectTrashMode.NONE,
        });
    }

    /**
     * 获取用户信息
     * @param id
     */
    @Get(':id')
    @Guest()
    @SerializeOptions({ groups: ['user-detail'] })
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id, async (qb) => qb.andWhere({ deletedAt: Not(IsNull()) }));
    }

    /**
     * 新增用户
     * @param data
     */
    @Post()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['user-detail'] })
    async store(
        @Body()
        data: CreateUserDto,
    ) {
        return this.service.create(data);
    }

    /**
     * 更新用户
     * @param data
     */
    @Patch()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['user-detail'] })
    async update(
        @Body()
        data: UpdateUserDto,
    ) {
        return this.service.update(data);
    }

    /**
     * 批量删除用户
     * @param data
     */
    @Delete()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['user-list'] })
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }

    /**
     * 批量恢复用户
     * @param data
     */
    @Patch('restore')
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['user-list'] })
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }
}