// src/modules/restful/restful.ts
import { Injectable, Type, INestApplication } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isNil, omit, trim } from 'lodash';

import { BaseRestful } from './base';
import { genDocPath } from './helpers';
import {
    ApiConfig,
    APIDocOption,
    ApiDocSource,
    RouteOption,
    SwaggerOption,
    VersionOption,
} from './types';

@Injectable()
export class Restful extends BaseRestful {
    /**
     * create方法用于创建配置，创建路由树和路由模块树，已经创建Swagger文档的配置
     * @param config 
     */
    async create(config: ApiConfig) {
        this.createConfig(config);
        await this.createRoutes();
        this.createDocs();
    }

    /**
     * getModuleImports方法用于获取所有需要导入到RestfulModule的路由模块，以及RouterModule
     * @returns 
     */
    getModuleImports() {
        return [RouterModule.register(this.routes), ...Object.values(this.modules)];
    }

     /**
     * 文档列表
     */
     protected _docs!: {
        [version: string]: APIDocOption;
    };

    /**
     * 排除已经添加的模块
     */
    protected excludeVersionModules: string[] = [];

    get docs() {
        return this._docs;
    }

    /**
     * 生成路由文档
     * @param option
     * @param routes
     * @param parent
     */
    protected getRouteDocs(
        option: Omit<SwaggerOption, 'include'>,
        routes: RouteOption[],
        parent?: string,
    ): { [key: string]: SwaggerOption } {
        /**
         * 合并Doc配置
         *
         * @param {Omit<SwaggerOption, 'include'>} vDoc
         * @param {RouteOption} route
         */
        const mergeDoc = (vDoc: Omit<SwaggerOption, 'include'>, route: RouteOption) => ({
            ...vDoc,
            ...route.doc,
            tags: Array.from(new Set([...(vDoc.tags ?? []), ...(route.doc?.tags ?? [])])),
            path: genDocPath(route.path, this.config.docuri, parent),
            include: this.getRouteModules([route], parent),
        });
        let routeDocs: { [key: string]: SwaggerOption } = {};

        // 判断路由是否有除tags之外的其它doc属性
        const hasAdditional = (doc?: ApiDocSource) =>
            doc && Object.keys(omit(doc, 'tags')).length > 0;

        for (const route of routes) {
            const { name, doc, children } = route;
            const moduleName = parent ? `${parent}.${name}` : name;

            // 加入在版本DOC中排除模块列表
            if (hasAdditional(doc) || parent) this.excludeVersionModules.push(moduleName);

            // 添加到routeDocs中
            if (hasAdditional(doc)) {
                routeDocs[moduleName.replace(`${option.version}.`, '')] = mergeDoc(option, route);
            }
            if (children) {
                routeDocs = {
                    ...routeDocs,
                    ...this.getRouteDocs(option, children, moduleName),
                };
            }
        }
        return routeDocs;
    }

    /**
     * 排除已经添加的模块
     * @param routeModules
     */
    protected filterExcludeModules(routeModules: Type<any>[]) {
        const excludeModules: Type<any>[] = [];
        const excludeNames = Array.from(new Set(this.excludeVersionModules));
        for (const [name, module] of Object.entries(this._modules)) {
            if (excludeNames.includes(name)) excludeModules.push(module);
        }
        return routeModules.filter(
            (rmodule) => !excludeModules.find((emodule) => emodule === rmodule),
        );
    }

    /**
     * 生成版本文档配置
     * 
     * 根据版本的文档配置设置一个默认的文档配置
     * 获取版本的路由集的Swagger配置
     * 过滤掉已经添加到include的路由模块
     * 如果还有多余的模块或者在没有当路由没文档的情况下，把include添加到选项中
     * 返回文档的版本配置
     * @param name
     * @param voption
     * @param isDefault
     */
    protected getDocOption(name: string, voption: VersionOption, isDefault = false) {
        const docConfig: APIDocOption = {};
        // 默认文档配置
        const defaultDoc = {
            title: voption.title!,
            description: voption.description!,
            tags: voption.tags ?? [],
            auth: voption.auth ?? false,
            version: name,
            path: trim(`${this.config.docuri}${isDefault ? '' : `/${name}`}`, '/'),
        };
        // 获取路由文档
        const routesDoc = isDefault
            ? this.getRouteDocs(defaultDoc, voption.routes ?? [])
            : this.getRouteDocs(defaultDoc, voption.routes ?? [], name);
        if (Object.keys(routesDoc).length > 0) {
            docConfig.routes = routesDoc;
        }
        const routeModules = isDefault
            ? this.getRouteModules(voption.routes ?? [])
            : this.getRouteModules(voption.routes ?? [], name);
        // 文档所依赖的模块
        const include = this.filterExcludeModules(routeModules);
        // 版本DOC中有依赖的路由模块或者版本DOC中没有路由DOC则添加版本默认DOC
        if (include.length > 0 || !docConfig.routes) {
            docConfig.default = { ...defaultDoc, include };
        }
        return docConfig;
    }

    /**
     * 创建文档配置
     */
    protected createDocs() {
        const versionMaps = Object.entries(this.config.versions);
        const vDocs = versionMaps.map(([name, version]) => [
            name,
            this.getDocOption(name, version),
        ]);
        this._docs = Object.fromEntries(vDocs);
        const defaultVersion = this.config.versions[this._default];
        // 为默认版本再次生成一个文档
        this._docs.default = this.getDocOption(this._default, defaultVersion, true);
    }

    /**
     * 构建Open API
     * 根据每个版本的文档配置启动多个Swagger应用
     * @param container
     */
    async factoryDocs<T extends INestApplication>(
        container: T,
        metadata?: () => Promise<Record<string, any>>
    ) {
        const docs = Object.values(this._docs)
            .map((vdoc) => [vdoc.default, ...Object.values(vdoc.routes ?? {})])
            .reduce((o, n) => [...o, ...n], [])
            .filter((i) => !!i);
        for (const voption of docs) {
            const { title, description, version, auth, include, tags } = voption!;
            const builder = new DocumentBuilder();
            if (title) builder.setTitle(title);
            if (description) builder.setDescription(description);
            if (auth) builder.addBearerAuth();
            if (tags) {
                tags.forEach((tag) =>
                    typeof tag === 'string'
                        ? builder.addTag(tag)
                        : builder.addTag(tag.name, tag.description, tag.externalDocs),
                );
            }
            builder.setVersion(version);

            if (!isNil(metadata)) await SwaggerModule.loadPluginMetadata(metadata);
            const document = SwaggerModule.createDocument(container, builder.build(), {
                include: include.length > 0 ? include : [() => undefined as any],
                ignoreGlobalPrefix: true,
                deepScanRoutes: true,
            });
            SwaggerModule.setup(voption!.path, container, document);
        }
    }
}