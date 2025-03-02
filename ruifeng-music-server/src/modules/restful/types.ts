// src/modules/restful/types.ts
import { Type } from '@nestjs/common';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
/**
 * 标签选项
 * 这个接口定义了Swagger文档中标签的选项。标签通常用于组织和分类API端点，帮助用户更容易地浏览和理解API。
 */
export interface TagOption {
    // 标签的名称，通常是一个字符串。这是一个必需的字段，用于标识标签。
    name: string;
    // 标签的描述（可选），提供有关该标签的更多信息
    description?: string;
    // 关联的外部文档（可选），提供额外的相关文档链接
    externalDocs?: ExternalDocumentationObject;
}

/**
 * 总配置,版本,路由中用于swagger的选项
 * 这个接口定义了Swagger文档的总体配置选项。它用于设置Swagger文档的标题、描述、认证要求和标签等。接口定义如下：
 */
export interface ApiDocSource {
    // 文档的标题，通常是API文档的名称。
    title?: string;
    // Swagger文档的描述（可选）
    description?: string;
    // 一个布尔值，指示是否需要认证。如果为 true，则文档中的API端点需要认证才能访问。
    auth?: boolean;
    // 标签列表，可以是字符串或 TagOption 对象。标签用于在Swagger UI中组织API端点。
    tags?: (string | TagOption)[];
}

/**
 * 路由配置
 */
export interface RouteOption {
    // name: 用于指定当前路由集的名称
    name: string;
    // 指定当前路由集的路径前缀，由于我们支持嵌套路由，所以这个是总前缀
    path: string;
    // 指定控制器列表
    controllers: Type<any>[];
    //  用于指定嵌套的子路由集
    children?: RouteOption[];
    // 用于指定路由集的Swagger文档配置
    doc?: ApiDocSource;
}

/**
 * 版本配置
 */
export interface VersionOption extends ApiDocSource {
    routes?: RouteOption[];
}

/**
 * API配置
 */
export interface ApiConfig extends ApiDocSource {
    // 用于指定Open API的文档前缀，比如api/docs
    docuri?: string;
    // 用于指定默认的API版本
    default: string;
    // 用于指定启用的版本号列表，其中默认版本无需再加入该数组
    enabled: string[];
    // 每个API版本的具体配置
    versions: Record<string, VersionOption>;
}

/**
 * swagger选项
 */
export interface SwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    // 该文档包含的路由模块
    include: Type<any>[];
}

/**
 * API与swagger整合的选项
 */
export interface APIDocOption {
    default?: SwaggerOption;
    routes?: { [key: string]: SwaggerOption };
}