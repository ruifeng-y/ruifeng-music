// src/modules/content/subscribers/post.subscriber.ts
import { SanitizeService } from '../services/sanitize.service';
import { PostRepository } from '../repositories/post.repository';
import { PostEntity } from '../entities/post.entity';
import { PostBodyType } from '../../content/constants';
import { EventSubscriber,DataSource} from 'typeorm';
import { BaseSubscriber } from '../../database/base/subscriber';
import { Optional } from '@nestjs/common';
// import { Configure } from '../../config/configure';
import { isNil } from 'lodash';

@EventSubscriber()
export class PostSubscriber extends BaseSubscriber<PostEntity>{
    protected entity = PostEntity;
    // constructor(
    //     protected dataSource: DataSource,
    //     protected sanitizeService: SanitizeService,
    //     protected postRepository: PostRepository,
    // ) {
    //     dataSource.subscribers.push(this);
    // }

    constructor(
        protected dataSource: DataSource,
        protected postRepository: PostRepository,
        // protected configure: Configure,
        @Optional() protected sanitizeService?: SanitizeService,
    ) {
        super(dataSource);
    }

    listenTo() {
        return PostEntity;
    }

    // /**
    //  * 加载文章数据的处理
    //  * @param entity
    //  */
    // async afterLoad(entity: PostEntity) {
    //     if (entity.type === PostBodyType.HTML) {
    //         entity.body = this.sanitizeService.sanitize(entity.body);
    //     }
    // }

    /**
     * 加载文章数据的处理
     * @param entity
     */
    async afterLoad(entity: PostEntity) {
        // if (entity.type === PostBodyType.HTML) {
        //     entity.body = this.sanitizeService.sanitize(entity.body);
        // }

        // if (
        //     (await this.configure.get('content.htmlEnabled')) &&
        //     !isNil(this.sanitizeService) &&
        //     entity.type === PostBodyType.HTML
        // ) {
        //     entity.body = this.sanitizeService.sanitize(entity.body);
        // }

        // 使SanitizeService通过container实例获取，而不是直接注入
        const sanitizeService = (await this.configure.get('content.htmlEnabled'))
            ? this.container.get(SanitizeService)
            : undefined;
        if (!isNil(sanitizeService) && entity.type === PostBodyType.HTML) {
            entity.body = sanitizeService.sanitize(entity.body);
        }
    }
}