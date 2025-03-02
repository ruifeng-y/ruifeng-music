import {CustomRepository} from '../../database/decorators/repository.decorator';
import { BaseRepository } from '@/modules/database/base/repository';
import { SongEntity } from '../entities/song.entity';

@CustomRepository(SongEntity)
export class SongRepository extends BaseRepository<SongEntity> {
    protected _qbName = 'song';

    /**
     * 构建基础查询器
    */
    buildBaseQB() {
        return this.createQueryBuilder('song');
    }

}