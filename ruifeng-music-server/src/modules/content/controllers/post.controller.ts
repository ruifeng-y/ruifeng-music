// src/modules/content/controllers/post.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    ParseUUIDPipe,
    SerializeOptions,
    
} from '@nestjs/common';
import { DeleteWithTrashDto, RestoreDto } from '@/modules/restful/dtos/delete-with-trash.dto';
import { PostService } from '../services/post.service';
import { ContentModule } from '../content.module';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '@/modules/user/entities';
import { Permission } from '@/modules/rbac/decorators';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { PostEntity } from '../entities';
import { PostRepository } from '../repositories';
import { In, IsNull, Not } from 'typeorm';
import {
    FrontendCreatePostDto,
    FrontendQueryPostDto,
    OnwerUpdatePostDto,
    OwnerQueryPostDto,
} from '../dtos';
import { Guest, ReqUser } from '@/modules/user/decorators';
import { checkOwnerPermission } from '@/modules/rbac/helpers';
import { SelectTrashMode } from '@/modules/database/constants';

const permissions: Record<'create' | 'owner', PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, PostEntity.name),
    owner: async (ab, ref, request) =>
        checkOwnerPermission(ab, {
            request,
            getData: async (items) =>
                ref.get(PostRepository, { strict: false }).find({
                    relations: ['author'],
                    where: { id: In(items) },
                }),
        }),
};

@ApiTags('文章操作')
@Controller('posts')
@Depends(ContentModule)
// @Depends(ContentModule)
// @UseInterceptors(AppIntercepter)
export class PostController {
    constructor(protected service: PostService) {}

    // @Get()
    // async list(
    //     @Query()
    //     options: PaginateOptions,
    // ) {
    //     return this.service.paginate(options);
    // }

    // @Get(':id')
    // @SerializeOptions({ groups: ['post-detail'] })
    // async detail(
    //     @Param('id', new ParseUUIDPipe())
    //     id: string,
    // ) {
    //     return this.service.detail(id);
    // }

    // @Post()
    // async store(
    //     @Body()
    //     data: Record<string, any>,
    // ) {
    //     return this.service.create(data);
    // }

    // @Patch()
    // async update(
    //     @Body()
    //     data: Record<string, any>,
    // ) {
    //     return this.service.update(data);
    // }

    // @Delete(':id')
    // @SerializeOptions({ groups: ['post-detail'] })
    // async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    //     return this.service.delete(id);
    // }



    // @Get()
    // @SerializeOptions({ groups: ['post-list'] })
    // async list(
    //     @Query(
    //         new ValidationPipe({
    //             transform: true,
    //             whitelist: true,
    //             forbidNonWhitelisted: true,
    //             forbidUnknownValues: true,
    //             validationError: { target: false },
    //         }),
    //     )
    //     options: QueryPostDto,
    // ) {
    //     return this.service.paginate(options);
    // }
  
    // @Post()
    // @SerializeOptions({ groups: ['post-detail'] })
    // async store(
    //     @Body(
    //         new ValidationPipe({
    //             transform: true,
    //             whitelist: true,
    //             forbidNonWhitelisted: true,
    //             forbidUnknownValues: true,
    //             validationError: { target: false },
    //             groups: ['create'],
    //         }),
    //     )
    //     data: CreatePostDto,
    // ) {
    //     return this.service.create(data);
    // }

    // @Patch()
    // @SerializeOptions({ groups: ['post-detail'] })
    // async update(
    //     @Body(
    //         new ValidationPipe({
    //             transform: true,
    //             whitelist: true,
    //             forbidNonWhitelisted: true,
    //             forbidUnknownValues: true,
    //             validationError: { target: false },
    //             groups: ['update'],
    //         }),
    //     )
    //     data: UpdatePostDto,
    // ) {
    //     return this.service.update(data);
    // }

    // 删除掉@Body,@Query中的验证管道

    /**
     * 查询文章列表
     * @param options
     */
    @Get()
    @SerializeOptions({ groups: ['post-list'] })
    @Guest()
    async list(
        @Query()
        options: FrontendQueryPostDto,
    ) {
        return this.service.paginate({
            ...options,
            isPublished: true,
            trashed: SelectTrashMode.NONE,
        });
    }

    /**
     * 分页查询自己发布的文章列表
     * @param options
     */
    @Get('onwer')
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-list'] })
    async listOwner(
        @Query()
        options: OwnerQueryPostDto,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.paginate({
            ...options,
            author: author.id,
        });
    }


    /**
     * 查询文章详情
     * @param id
     */
    @Get(':id')
    @SerializeOptions({ groups: ['post-detail'] })
    @Guest()
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id, async (qb) =>
            qb.andWhere({ publishedAt: Not(IsNull()), deletedAt: Not(IsNull()) }),
        );
    }

    /**
     * 查询自己发布的文章详情
     * @param id
     */
    @Get('owner/:id')
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @Permission(permissions.owner)
    async detailOwner(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id, async (qb) => qb.withDeleted());
    }

    /**
     * 新增文章
     * @param data
     */
    @Post()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @Permission(permissions.create)
    async store(
        @Body()
        data: FrontendCreatePostDto,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.create(data, author);
    }

    /**
     * 更新自己发布的文章
     * @param data
     */
    @Patch()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-detail'] })
    @Permission(permissions.owner)
    async update(
        @Body()
        data: OnwerUpdatePostDto,
    ) {
        return this.service.update(data);
    }

    // @Patch()
    // @SerializeOptions({ groups: ['post-detail'] })
    // async update(
    //     @Body()
    //     data: UpdatePostDto,
    // ) {
    //     return this.service.update(data);
    // }

    // @Delete(':id')
    // @SerializeOptions({ groups: ['post-detail'] })
    // async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    //     return this.service.delete(id);
    // }

    /**
     * 批量删除文章
     * @param data
     */
    @Delete()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-list'] })
    @Permission(permissions.owner)
    async delete(
        @Body()
        data: DeleteWithTrashDto,
    ) {
        const { ids, trash } = data;
        return this.service.delete(ids, trash);
    }

    /**
     * 批量恢复自己发布的文章
     * @param data
     */
    @Patch('restore')
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['post-list'] })
    @Permission(permissions.owner)
    async restore(
        @Body()
        data: RestoreDto,
    ) {
        const { ids } = data;
        return this.service.restore(ids);
    }

    // @Patch('restore')
    // @SerializeOptions({ groups: ['post-list'] })
    // async restore(
    //     @Body()
    //     data: RestoreDto,
    // ) {
    //     const { ids } = data;
    //     return this.service.restore(ids);
    // }



    
}