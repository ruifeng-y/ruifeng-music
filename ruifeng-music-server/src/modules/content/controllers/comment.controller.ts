import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    Query,
    SerializeOptions,
    
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { QueryCommentTreeDto, QueryCommentDto, CreateCommentDto  } from '@/modules/content/dtos/comment.dto';
import { DeleteDto } from '@/modules/restful/dtos/delete.dto';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { ContentModule } from '../content.module';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserEntity } from '@/modules/user/entities';
import { PermissionChecker } from '@/modules/rbac/types';
import { PermissionAction } from '@/modules/rbac/constants';
import { Permission } from '@/modules/rbac/decorators';
import { CommentEntity } from '../entities';
import { checkOwnerPermission } from '@/modules/rbac/helpers';
import { CommentRepository } from '../repositories';
import { In } from 'typeorm';
import { Guest, ReqUser } from '@/modules/user/decorators';

const permissions: Record<'create' | 'owner', PermissionChecker> = {
    create: async (ab) => ab.can(PermissionAction.CREATE, CommentEntity.name),
    owner: async (ab, ref, request) =>
        checkOwnerPermission(ab, {
            request,
            getData: async (items) =>
                ref.get(CommentRepository, { strict: false }).find({
                    relations: ['user'],
                    where: { id: In(items) },
                }),
        }),
};

// @UseInterceptors(AppIntercepter)
@ApiTags('评论操作')
@Depends(ContentModule)
@Controller('comments')
export class CommentController {
    constructor(protected service: CommentService) {}

    /**
     * 查询评论树
     * @param query
     */
    @Get('tree')
    @SerializeOptions({ groups: ['comment-tree'] })
    @Guest()
    async tree(
        @Query()
        query: QueryCommentTreeDto,
    ) {
        return this.service.findTrees(query);
    }


    /**
     * 查询评论列表
     * @param query
     */
    @Get()
    @SerializeOptions({ groups: ['comment-list'] })
    @Guest()
    async list(
        @Query()
        query: QueryCommentDto,
    ) {
        return this.service.paginate(query);
    }

    /**
     * 新增评论
     * @param data
     */
    @Post()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['comment-detail'] })
    @Permission(permissions.create)
    async store(
        @Body()
        data: CreateCommentDto,
        @ReqUser() author: ClassToPlain<UserEntity>,
    ) {
        return this.service.create(data, author);
    }

    /**
     * 批量删除评论
     * @param data
     */
    @Delete()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['comment-list'] })
    @Permission(permissions.owner)
    async delete(
        @Body()
        data: DeleteDto,
    ) {
        const { ids } = data;
        return this.service.delete(ids);
    }
}