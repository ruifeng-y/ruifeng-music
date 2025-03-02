// src/modules/content/controllers/category.controller.ts
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
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto  } from '@/modules/content/dtos/category.dto';
import { DeleteDto } from '@/modules/restful/dtos/delete.dto';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { ContentModule } from '../content.module';
import { Guest } from '@/modules/user/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginateDto } from '@/modules/restful/dtos';

// @UseInterceptors(AppIntercepter)
@ApiTags('分类操作')
@Depends(ContentModule)
@Controller('categories')
export class CategoryController {
    constructor(protected service: CategoryService) {}

    // /**
    //  * 查询分类树
    //  * @returns 
    //  */
    // @Get('tree')
    // @Guest()
    // @SerializeOptions({ groups: ['category-tree'] })
    // // @ApiOperation({ summary: '查询分类树' })
    // async tree() {
    //     return this.service.findTrees();
    // }

    /**
     * 查询分类树
     * @param options
     */
    @Get('tree')
    @SerializeOptions({ groups: ['category-tree'] })
    @Guest()
    async tree() {
        return this.service.findTrees();
    }

    // /**
    //  * 分页查询分类列表
    //  * @param options 
    //  * @returns 
    //  */
    // @Get()
    // @SerializeOptions({ groups: ['category-list'] })
    // @Guest()
    // async list(
    //     @Query()
    //     options: QueryCategoryDto,
    // ) {
    //     return this.service.paginate(options);
    // }

    /**
     * 分页查询分类列表
     * @param options
     */
    @Get()
    @SerializeOptions({ groups: ['category-list'] })
    @Guest()
    async list(@Query() options: PaginateDto) {
        return this.service.paginate(options);
    }
    

    /**
     * 分页详解查询
     * @param id
     */
    @Get(':id')
    @SerializeOptions({ groups: ['category-detail'] })
    @Guest()
    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.service.detail(id);
    }

    /**
     * 新增分类
     * @param data 
     * @returns 
     */
    @Post()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['category-detail'] })
    // @ApiOperation({ summary: '新增分类' })
    async store(
        @Body()
        data: CreateCategoryDto,
    ) {
        return this.service.create(data);
    }

    /**
     * 更新分类
     * @param data 
     * @returns 
     */
    @Patch()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['category-detail'] })
    // @ApiOperation({ summary: '更新分类' })
    async update(
        @Body()
        data: UpdateCategoryDto,
    ) {
        return this.service.update(data);
    }

    // @Delete(':id')
    // @SerializeOptions({ groups: ['category-detail'] })
    // async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    //     return this.service.delete(id);
    // }

    /**
     * 批量删除分类
     * @param data 
     * @returns 
     */
    @Delete()
    @ApiBearerAuth()
    @SerializeOptions({ groups: ['category-list'] })
    // @ApiOperation({ summary: '删除分类' })
    async delete(
        @Body()
        data: DeleteDto,
    ) {
        const { ids } = data;
        return this.service.delete(ids);
    }
}