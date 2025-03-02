// src/config/meilli.config.ts
import type { MelliConfig } from '@/modules/meilisearch/types';

export const meilli = (): MelliConfig => [
    {
        name: 'default',
        host: 'http://localhost:7700',
    },
];