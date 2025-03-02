/**
 * 数据验证
   因为用户模块后续会涉及到非常多的功能，比如找回密码，OAuth登录，邮箱或短信验证的注册登录等，这样就需要写非常多的重复性的字段验证，
   使得代码大量冗余。于是，我们可以把重复性的验证字段抽象出来，并使用不同的分组来实现不同的DTO类中同一个字段的不同验证组
 */


/**
 * 用户请求DTO验证组
 * user-create: 创建用户验证（在后续权限模块的课程后，此验证组只用于管理员对用户的CRUD操作）
 * user-update: 更新用户验证（在后续权限模块的课程后，此验证组只用于管理员对用户的CRUD操作）
 * user-register: 用户注册验证
 * user-account-update: 用户账户信息更新验证
 * user-change-password: 用户密码更新验证
 */
export enum UserValidateGroups {
    USER_CREATE = 'user-create',
    USER_UPDATE = 'user-update',
    USER_REGISTER = 'user-register',
    ACCOUNT_UPDATE = 'account-update',
    CHANGE_PASSWORD = 'change-password',
}

// Guest装饰器用于装饰一些可不登录匿名访问的接口（控制器方法）
// 我们会把下面的JWT添加到全局，默认所有接口都需要登录后访问，所以对于一些不需要登录即可访问的接口添加这个装饰器
export const ALLOW_GUEST = 'allowGuest';

/**
 * 用户列表查询排序方式
 */
export enum UserOrderType {
  CREATED = 'createdAt',
  UPDATED = 'updatedAt',
}