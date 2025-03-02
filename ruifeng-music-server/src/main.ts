// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { exp1 } from './example/exp1';
// import { exp2 } from './example/exp2';
// import { exp3 } from './example/exp3';
// import { exp4 } from './example/exp4';
// import { exp5 } from './example/exp5';
// import { exp6 } from './example/exp6';
// import { exp7 } from './example/exp7';

// import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

// import { ContentModule } from './modules/content/content.module';
// import { CoreModule } from './modules/core/core.module';
// import { DatabaseModule } from './modules/database/database.module';
// import { useContainer } from 'class-validator';



// async function bootstrap() {
//   // exp1();
//   // exp2();
//   // exp4();
//   // exp5();
//   // exp6();
//   // exp7();
//   // const app = await NestFactory.create(AppModule);
//   // await app.listen(3000);


//   // 使用fastify驱动
//   const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
//     // 启用跨域访问
//     cors: true,
//     // 只使用error和warn这两种输出，避免在控制台冗余输出
//     logger: ['error', 'warn'],
//   });

//   // 为class-validator添加容器以便在自定义约束中可以注入dataSource等依赖
//   useContainer(app.select(AppModule), {
//     fallbackOnErrors: true,
//   });

//   // 设置全局访问前缀
//   app.setGlobalPrefix('api');
//   // 启动后的输出
//   await app.listen(3100, () => {
//       console.log('api: http://localhost:3100');
//   });

// }
// bootstrap();

import { createApp, startApp } from './modules/core/helpers';
// import { listened } from './modules/core/helpers';
import { createOptions } from './options';
import { listened } from './modules/restful/helpers';


startApp(createApp(createOptions), listened);
