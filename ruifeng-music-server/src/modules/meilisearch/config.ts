// src/modules/meilisearch/config.ts
import { createConnectionOptions } from '../config/helpers';
import { ConfigureFactory, ConfigureRegister } from '../config/types';
import type { MelliConfig } from './types';

export const createMeilliConfig: (
    register: ConfigureRegister<RePartial<MelliConfig>>,
) => ConfigureFactory<MelliConfig, MelliConfig> = (register) => ({
    register,
    hook: (configure, value) => createConnectionOptions(value),
});

// src/config/meilli.config.ts
export const meilli = createMeilliConfig((configure) => [
    {
        name: 'default',
        host: 'http://localhost:7700',
    },
]);