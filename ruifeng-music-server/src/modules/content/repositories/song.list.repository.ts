import { SongListEntity } from "../entities/song.list.entity";
import { BaseRepository } from '@/modules/database/base/repository';
import {CustomRepository} from '../../database/decorators/repository.decorator';

@CustomRepository(SongListEntity)
export class SongListRepository extends BaseRepository<SongListEntity> {
    protected _qbName = 'song_list';

    /**
     * 构建基础查询器
     */
    buildBaseQB() {
        return this.createQueryBuilder('song_list');
    }

    
}