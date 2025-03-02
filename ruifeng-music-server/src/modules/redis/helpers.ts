import { createConnectionOptions } from '@/modules/config/helpers';
import { ConfigureFactory, ConfigureRegister } from '@/modules/config/types';

import { RedisConfig, RedisConfigOptions } from './types';

export const createRedisConfig: (
    register: ConfigureRegister<RePartial<RedisConfigOptions>>,
) => ConfigureFactory<RedisConfigOptions, RedisConfig> = (register) => ({
    register,
    hook: (configure, value) => createConnectionOptions(value),
    defaultRegister: async (configure) => ({
        host: await  configure.get('REDIS_HOST', '127.0.0.1'),
        port: await  configure.get<number>('REDIS_PORT', 6379),
    }),
});


