import { Module, ModuleMetadata } from '@nestjs/common';
import { PostService } from './services/post.service';
// import { SearchService } from './services/search.service';

// import { PostEntity } from '../content/entities/post.entity';
// import { PostRepository } from '../content/repositories/post.repository';
import { PostSubscriber } from '../content/subscribers/post.subscriber';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../database/database.module';
import * as entities from './entities';
import * as repositories from './repositories';
// import * as controllers from './controllers';
import * as services from './services';
import { SanitizeService } from './services/sanitize.service';
import { ContentConfig } from '@/modules/content/types';
import { Configure } from '../config/configure';
import { defaultContentConfig } from './config';
import { SearchService } from './services/search.service';
import * as subscribers from './subscribers';
import { addEntities, addSubscribers } from '../database/helpers';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/repositories/user.repository';
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([PostEntity]),
//     DatabaseModule.forRepository([PostRepository]),
//   ],
//   controllers: [PostController],
//   providers: [PostService],
//   exports: [PostService],
// })

// @Module({
//   imports: [
//       TypeOrmModule.forFeature(Object.values(entities)),
//       DatabaseModule.forRepository(Object.values(repositories)),
//   ],
//   controllers: Object.values(controllers),
//   providers: [...Object.values(services), SanitizeService, PostSubscriber],
//   exports: [
//       ...Object.values(services),
//       DatabaseModule.forRepository(Object.values(repositories)),
//   ],
// })
@Module({})
export class ContentModule {
//   static  forRoot(configRegister?: () => ContentConfig): DynamicModule {
static async forRoot(configure: Configure) {
    const config = await configure.get<ContentConfig>('content', defaultContentConfig);
    // const config: Required<ContentConfig> = {
    //     searchType: 'mysql',
    //     ...(configRegister ? configRegister() : {}),
    // };
    const providers: ModuleMetadata['providers'] = [
        ...Object.values(services),
        ...(await addSubscribers(configure, Object.values(subscribers))),
        SanitizeService,
        PostSubscriber,
        {
            provide: PostService,
            inject: [
                repositories.PostRepository,
                repositories.CategoryRepository,
                services.CategoryService,
                repositories.TagRepository,
                { token: SearchService, optional: true },
            ],
            useFactory(
                postRepository: repositories.PostRepository,
                userRepository: UserRepository,
                categoryRepository: repositories.CategoryRepository,
                categoryService: services.CategoryService,
                tagRepository: repositories.TagRepository,
                searchService: SearchService,
            ) {
                return new PostService(
                    postRepository,
                    categoryRepository,
                    categoryService,
                    tagRepository,
                    userRepository,
                    searchService,
                    config.searchType,
                );
            },
        },
    ];
    const exports: ModuleMetadata['exports'] = [
        ...Object.values(services),
        PostService,
        DatabaseModule.forRepository(Object.values(repositories)),
    ];
    if (config.htmlEnabled) {
        providers.push(SanitizeService);
        exports.push(SanitizeService);
    }
    if (config.searchType === 'meilli') {
        providers.push(SearchService);
        exports.push(SearchService);
    }
    // if (config.searchType === 'meilli') providers.push(services.SearchService);
    return {
        module: ContentModule,
        imports: [
            UserModule,
            // TypeOrmModule.forFeature(Object.values(entities)),
            await addEntities(configure, Object.values(entities)),
            DatabaseModule.forRepository(Object.values(repositories)),
        ],
        // controllers: Object.values(controllers),
        providers,
        exports,
        // exports: [
        //     ...Object.values(services),
        //     PostService,
        //     DatabaseModule.forRepository(Object.values(repositories)),
        // ],
    };
  }
}
