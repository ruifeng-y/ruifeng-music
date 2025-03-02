import { createOptions } from '@/options';

import { buildCli, createApp } from '../modules/core/helpers';

buildCli(createApp(createOptions));