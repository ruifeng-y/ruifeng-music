// src/modules/content/controllers/tag.controller.ts
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

import { TagService } from '../services/tag.service'
// import { QueryCategoryDto    } from '@/modules/content/dtos/category.dto';
import { CreateTagDto, UpdateTagDto  } from '@/modules/content/dtos/tag.dto';
import { DeleteDto } from '@/modules/restful/dtos/delete.dto';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { ContentModule } from '../content.module';
import { ApiTags } from '@nestjs/swagger';
import { Guest } from '@/modules/user/decorators';
import { PaginateDto } from '@/modules/restful/dtos';


// @UseInterceptors(AppIntercepter)
@ApiTags('标签操作')
@Depends(ContentModule)
@Controller('tags')
export class TagController {
    constructor(protected service: TagService) {}

    // @Get()
    // @SerializeOptions({})
    // async list(
    //     @Query()
    //     options: QueryCategoryDto,
    // ) {
    //     return this.service.paginate(options);
    // }

    /**
     * 分页查询标签列表
     * @param options
     */
    @Get()
    @SerializeOptions({})
    @Guest()
    async list(
        @Query()
        options: PaginateDto,
    ) {
        return this.service.paginate(options);
    }

    // @Get(':id')
    // @SerializeOptions({})
    // async detail(
    //     @Param('id', new ParseUUIDPipe())
    //     id: string,
    // ) {
    //     return this.service.detail(id);
    // }

    /**
     * 查询标签详情
     * @param id
     */
    @Get(':id')
    @SerializeOptions({})
    @Guest()
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    @Post()
    @SerializeOptions({})
    async store(
        @Body()
        data: CreateTagDto,
    ) {
        return this.service.create(data);
    }

    @Patch()
    @SerializeOptions({})
    async update(
        @Body()
        data: UpdateTagDto,
    ) {
        return this.service.update(data);
    }

    // @Delete(':id')
    // @SerializeOptions({})
    // async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    //     return this.service.delete(id);
    // }

    @Delete()
    @SerializeOptions({ groups: ['post-list'] })
    async delete(
        @Body()
        data: DeleteDto,
    ) {
        const { ids } = data;
        return this.service.delete(ids);
    }
}