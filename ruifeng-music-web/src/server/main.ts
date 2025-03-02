// /* eslint-disable unused-imports/no-unused-vars */
// import { swaggerUI } from '@hono/swagger-ui';
// import { prettyJSON } from 'hono/pretty-json';

// import { authApi } from './auth/api';
// import { createHonoApp } from './common/utils';
// import { postApi } from './post/api';

// const app = createHonoApp().basePath('/api');
// app.use(prettyJSON());
// app.get('/', (c) => c.text('3R Blog API'));
// app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));
// const routes = app.route('/posts', postApi).route('/auth', authApi);
// type AppType = typeof routes;
// app.doc('/swagger', {
//     openapi: '3.1.0',
//     info: {
//         version: 'v1',
//         title: '3R blog API',
//     },
// });
// app.get('/doc', swaggerUI({ url: '/api/swagger' }));
// // const client = hc<AppType>(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
// export {
//     app,
//     // client,
//     type AppType,
// };
