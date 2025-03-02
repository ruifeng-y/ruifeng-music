'use client';

import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';

// import { checkAccessToken } from '@/libs/token';
import { DateToString } from '@/libs/types';
import { AuthItem } from '@/server/auth/types';

import { useToast } from '../shadcn/use-toast';

import { Spinner } from '../spinner';

import { AuthContext } from './context';
import { AuthContextType } from './types';

const AuthProvider: FC<PropsWithChildren & { value: AuthContextType }> = ({ children, value }) => {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 全局认证状态包装器
 * @param children
 * @returns
 */
export const Auth: FC<PropsWithChildren> = ({ children }) => {
    const { toast } = useToast();
    const [auth, setAuth] = useState<DateToString<AuthItem> | null>(null);
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                // setChecked(false);
                // const data = await checkAccessToken();
                // setAuth(data);
            } catch (error) {
                toast({
                    title: '网络连接错误',
                    description: `${(error as Error).message}, 请尝试刷新页面`,
                });
            }
            setChecked(true);
        })();
    }, []);
    const value: AuthContextType = useMemo(() => ({ auth, setAuth }), [auth]);
    return (
        <AuthProvider value={value}>
            {checked ? (
                children
            ) : (
                <Spinner className="tw-bg-white tw-transition-opacity tw-duration-300" />
            )}
        </AuthProvider>
    );
};
