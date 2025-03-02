import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { SongService } from '../services/song.service';
import { ContentModule } from '../content.module';
import { Depends } from '@/modules/restful/decorators/depends.decorator';
import { Guest } from '@/modules/user/decorators';
import { QuerySongListDto } from '@/modules/content/dtos/song.list.dto';

@ApiTags('歌曲操作')
@Controller('song')
@Depends(ContentModule)
export class SongController {
    constructor(protected service: SongService) { }
    
    /**
     * 查询歌单列表 
     * @returns 
     */
    @Guest()
    @Get('querySongList')
    async querySongList() {
        return this.service.querySong();
    }
    
    /**
     * 查询歌单分页
     * @param query 
     * @returns 
    */
    @Guest()
    @Get('queryPageSong')
    async queryPageSong(
        @Query()
        query: QuerySongListDto,) {
        return this.service.paginate(query);
    }
}