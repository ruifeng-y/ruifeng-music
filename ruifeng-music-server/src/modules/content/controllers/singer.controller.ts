import { ApiTags } from '@nestjs/swagger';
import { Controller, Get , Query } from '@nestjs/common';
import { SingerService } from '../services/singer.service';
import { ContentModule } from '../content.module';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { Guest } from '@/modules/user/decorators';
import { QuerySingerDto } from '@/modules/content/dtos/singer.dto';

@ApiTags('歌手操作')
@Controller('singer')
@Depends(ContentModule)
export class SingerController {

    constructor(protected service: SingerService) {}

    @Guest()
    @Get('querySingerList')
    async querySongList() {
        return this.service.querySongSingers();
    }

    /**
     * 查询歌手分页
     * @param query 
     * @returns 
     */
    @Guest()
    @Get('queryPageSinger')
    async queryPageSinger(        
        @Query()
        query: QuerySingerDto,) {
        return this.service.paginate(query);
    }
}