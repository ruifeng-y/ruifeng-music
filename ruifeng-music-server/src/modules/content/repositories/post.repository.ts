// src/modules/content/repositories/post.repository.ts
import { PostEntity } from '../../content/entities/post.entity';
import {CustomRepository} from '../../database/decorators/repository.decorator';
import { CommentEntity } from '@/modules/content/entities/comment.entity';
import { BaseRepository } from '@/modules/database/base/repository';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
    protected _qbName = 'post';
    
    buildBaseQB() {
        // 在查询之前先查询出评论数量在添加到commentCount字段上
        return this.createQueryBuilder(this.qbName)
             // 添加上作者查询
            .leftJoinAndSelect(`${this.qbName}.author`, 'author')
            .leftJoinAndSelect(`${this.qbName}.category`, 'category')
            .leftJoinAndSelect(`${this.qbName}.tags`, 'tags')
            .addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(c.id)', 'count')
                    .from(CommentEntity, 'c')
                    .where(`c.post.id = ${this.qbName}.id`);
            }, 'commentCount')
            .loadRelationCountAndMap(`${this.qbName}.commentCount`, `${this.qbName}.comments`);
    }
}