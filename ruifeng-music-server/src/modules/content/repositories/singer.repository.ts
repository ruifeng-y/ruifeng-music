import { BaseRepository } from '@/modules/database/base/repository';
import {CustomRepository} from '../../database/decorators/repository.decorator';
import { SingerEntity } from '../entities';

@CustomRepository(SingerEntity)
export class SingerRepository extends BaseRepository<SingerEntity> {
    protected _qbName = 'singer';

    /**
     * 构建基础查询器
     */
    buildBaseQB() {
        return this.createQueryBuilder('singer');
    }
}