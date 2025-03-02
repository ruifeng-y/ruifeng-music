// src/config/database.config.ts
/**
 * 数据库配置
 */
import { createDbConfig } from '@/modules/database/config';
import { toNumber } from 'lodash';
import { ContentFactory } from '@/database/factories/content.factory';
import ContentSeeder from '@/database/seeders/content.seeder';
import { UserFactory } from '../database/factories/user.factory';
import UserSeeder from '@/database/seeders/user.seeder';

// export const database = (): TypeOrmModuleOptions => ({
//     // 以下为mysql配置
//     charset: 'utf8mb4',
//     logging: ['error'],
//     type: 'mysql',
//     host: '172.30.160.1',
//     port: 3306,
//     username: 'root',
//     password: 'root',
//     database: '3rapp',
//     // 以下为sqlite配置
//     // type: 'better-sqlite3',
//     // database: resolve(__dirname, '../../database.db'),
//     synchronize: true,
//     autoLoadEntities: true,
// });

// src/config/database.config.ts
export const database = createDbConfig((configure) => ({
    common: {
        synchronize: true,
    },
    connections: [
        {
            // 以下为mysql配置
            type: 'mysql',
            host: configure.env.get('DB_HOST', '172.21.160.1'),
            port: configure.env.get('DB_PORT', (v) => toNumber(v), 3306),
            username: configure.env.get('DB_USERNAME', 'root'),
            password: configure.env.get('DB_PASSWORD', 'root'),
            database: configure.env.get('DB_NAME', '3rapp'),
            factories: [UserFactory,ContentFactory],
            seeders: [UserSeeder,ContentSeeder],
        },
        // {
        // 以下为sqlite配置
        // type: 'better-sqlite3',
        // database: resolve(__dirname, configure.env.get('DB_PATH', '../../database.db')),
        // },
    ],
}));