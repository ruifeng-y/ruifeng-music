'use client';

// import { isNil } from 'lodash';
// import { useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { RiLockPasswordLine } from 'react-icons/ri';

// import { checkAccessToken } from '@/libs/token';
import { cn } from '@/libs/utils';

import { Button } from '../shadcn/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../shadcn/form';
import { Input } from '../shadcn/input';

import { useAuthLoginForm, useAuthLoginSubmitHandler } from './hooks';

export const AuthLoginForm: FC = () => {
    // const router = useRouter();
    const form = useAuthLoginForm();
    const [authEror, setAuthError] = useState<string | null>(null);
    const submitHandler = useAuthLoginSubmitHandler(setAuthError);
    useEffect(() => {
        (async () => {
            // const auth = await checkAccessToken();
            // if (!isNil(auth)) router.replace('/');
        })();
    }, []);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(submitHandler)} className="tw-space-y-3 !tw-mt-4">
                {authEror && (
                    <div
                        className={cn(
                            'tw-p-3 tw-rounded-md',
                            'tw-bg-red-50 tw-border tw-border-red-200',
                            'tw-text-sm tw-text-red-600',
                            'tw-transition-all tw-duration-300',
                        )}
                    >
                        {authEror}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="credential"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="tw-relative">
                                    <FiUser className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-gray-500 tw-h-4 tw-w-4" />
                                    <Input
                                        {...field}
                                        className="tw-pl-10"
                                        placeholder="请输入用户名或邮箱地址"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="tw-relative">
                                    <RiLockPasswordLine className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-text-gray-500 tw-h-4 tw-w-4" />
                                    <Input
                                        {...field}
                                        className="tw-pl-10"
                                        type="password"
                                        placeholder="请输入密码"
                                        disabled={form.formState.isSubmitting}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="tw-w-full !tw-mt-5"
                >
                    {form.formState.isSubmitting ? '登录中...' : '登录'}
                </Button>
            </form>
        </Form>
    );
};
