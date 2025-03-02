// src/config/content.config.ts
import { ContentConfig } from '@/modules/content/types';
export const content = (): ContentConfig => ({
    // searchType: 'mysql',
    searchType: 'meilli',
    htmlEnabled: false,
});


// // src/config/index.ts
// export * from './database.config';
// export * from './content.config';