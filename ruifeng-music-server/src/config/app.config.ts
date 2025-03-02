// src/config/app.config.ts
import { toNumber } from 'lodash';
import { createAppConfig } from '@/modules/core/config';

/**
 * 用途
 * 这段代码的用途是创建一个应用程序的配置对象，该对象包含了应用程序运行所需的一些基本配置信息，如端口号、API前缀和PM2的执行模式等。
 * 这些配置信息可以在应用程序的其他部分使用，以实现不同的功能。
 */
export const app = createAppConfig((configure) => ({
    // 环境变量：代码中使用了环境变量APP_PORT来配置应用程序的端口号。在使用之前，需要确保该环境变量已经在环境中设置。
    // 默认值：如果环境变量APP_PORT不存在，则使用默认值3100。这提供了一种灵活的方式来配置应用程序，可以根据不同的环境（如开发、测试、生产）使用不同的端口号。
    port: configure.env.get('APP_PORT', (v) => toNumber(v), 3100),
    prefix: 'api',
    // PM2集群模式：代码中设置了PM2的执行模式为cluster，这意味着应用程序将在多个进程之间进行负载均衡。这可以提高应用程序的并发处理能力和稳定性。
    pm2: {
        exec_mode: 'cluster',
    },
}));