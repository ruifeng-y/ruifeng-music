/**
 * 用户配置类型
 * hash: 对密码进行混淆时的hash数量值
 * jwt: jwt token的生成配置
 */
export interface UserConfig {
    hash: number;
    jwt: JwtConfig;
}

/**
 * JWT配置类型
 * token_expired: token过期时间
 * refresh_token_expired: refresh token过期时间
 */
export interface JwtConfig {
    token_expired: number;
    refresh_token_expired: number;
}

/**
 * JWT荷载签出对象
 * sub: 用户ID
 * iat: 签出时间
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}