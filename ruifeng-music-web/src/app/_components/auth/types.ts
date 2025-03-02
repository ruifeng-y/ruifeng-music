import { DateToString } from '@/libs/types';
import { AuthItem } from '@/server/auth/types';

/**
 * 用户认证的全局状态类型
 */
export type AuthContextType = {
    auth: DateToString<AuthItem> | null;
    setAuth: (auth: DateToString<AuthItem> | null) => void;
};
