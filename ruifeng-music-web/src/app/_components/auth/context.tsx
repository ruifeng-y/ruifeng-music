import { createContext } from 'react';

import { DateToString } from '@/libs/types';
import { AuthItem } from '@/server/auth/types';

import { AuthContextType } from './types';

/**
 * 用户认证的全局状态Context
 */
export const AuthContext = createContext<AuthContextType>({
    auth: null,
    setAuth: (item: DateToString<AuthItem> | null) => {},
});
