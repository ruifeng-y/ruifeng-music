// src/modules/rbac/constants.ts
export enum SystemRoles {
    USER = 'user',
    SUPER_ADMIN = 'super-admin',
}

export const PERMISSION_CHECKERS = 'permission_checkers';

export enum PermissionAction {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    MANAGE = 'manage',
    OWNER = 'onwer',
}