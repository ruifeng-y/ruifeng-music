// src/modules/content/services/sanitize.service.ts
import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

import { deepMerge } from '@/modules/core/helpers';
// import { merge as deepMerge } from 'lodash';

@Injectable()
export class SanitizeService {
    protected config: sanitizeHtml.IOptions = {};
    

    // constructor() {
    //     this.config = {
    //         allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'code']),
    //         allowedAttributes: {
    //             ...sanitizeHtml.defaults.allowedAttributes,
    //             '*': ['class', 'style', 'height', 'width'],
    //         },
    //         parser: {
    //             lowerCaseTags: true,
    //         },
    //     };
    // }

    constructor() {
        this.config = {
            allowedTags: ['img', 'code'], // Define your default allowed tags here
            allowedAttributes: {
                '*': ['class', 'style', 'height', 'width'],
            },
            parser: {
                lowerCaseTags: true,
            },
        };
    }

    sanitize(body: string, options?: sanitizeHtml.IOptions) {
        return sanitizeHtml(body, deepMerge(this.config, options ?? {}, 'replace'));
    }
}