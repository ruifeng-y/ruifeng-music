// import { Module } from '@nestjs/common';
// import { ContentModule } from './modules/content/content.module';
// import { DatabaseModule } from './modules/database/database.module';
// import { CoreModule } from './modules/core/core.module';
// import { MeilliModule } from './modules/meilisearch/melli.module';
// // import { database } from './config';
// import { AppPipe } from '@/modules/core/providers/app.pipe';
// import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
// import { AppIntercepter } from '@/modules/core/providers/app.interceptor';
// import { AppFilter } from '@/modules/core/providers/app.filter';
// import { content, database, meilli } from './config';
// import { ConfigModule } from './modules/config/config.module';
// import { UserModule } from './modules/user/user.module';

// @Module({
//   imports: [
//     ContentModule.forRoot(content),
//     // ContentModule,
//     CoreModule.forRoot(),
//     DatabaseModule.forRoot(database),
//     MeilliModule.forRoot(meilli),
//     ConfigModule,
// ],
// providers: [
//   // 全局验证管道
//   {
//       provide: APP_PIPE,
//       useValue: new AppPipe({
//           transform: true,
//           whitelist: true,
//           forbidNonWhitelisted: true,
//           forbidUnknownValues: true,
//           validationError: { target: false },
//       }),
//   },
//   // 全局序列化拦截器
//   {
//     provide: APP_INTERCEPTOR,
//     useClass: AppIntercepter,
//   },
//   // 全局异常过滤器
//   {
//     provide: APP_FILTER,
//     useClass: AppFilter,
//   },
  
// ],
// })
// export class AppModule {}
