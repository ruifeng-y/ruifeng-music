import { resolve } from 'path';

import { isNil } from 'lodash';

import { ConfigureFactory, ConfigureRegister } from '@/modules/config/types';

import { SmsConfig, SmtpConfig } from './types';

export const createSmsConfig: (
    register: ConfigureRegister<Partial<SmsConfig>>,
) => ConfigureFactory<Partial<SmsConfig>, SmsConfig> = (register) => ({
    register,
    defaultRegister: async (configure) => ({
        sign: await configure.get('SMS_QCLOUD_SIGN', 'your-sign'),
        region: await configure.get('SMS_QCLOUD_REGION', 'ap-guangzhou'),
        appid: await configure.get('SMS_QCLOUD_APPID', 'your-app-id'),
        secretId: await configure.get('SMS_QCLOUD_ID', 'your-secret-id'),
        secretKey: await configure.get('SMS_QCLOUD_KEY', 'your-secret-key'),
    }),
    storage: true,
});

// 导出一个函数，用于创建SMTP配置
export const createSmtpConfig: (
    register: ConfigureRegister<Partial<SmtpConfig>>,
) => ConfigureFactory<Partial<SmtpConfig>, SmtpConfig> = (register) => ({
    // 注册函数
    register,
    // 默认注册函数
    defaultRegister: async (configure) => {
        // 创建SMTP配置对象
        const config: SmtpConfig = {
            // 获取SMTP主机
            host: await configure.get('SMTP_HOST', 'your-smtp-host'),
            // 获取SMTP用户名
            user: await configure.get('SMTP_USER', 'your-smtp-username'),
            // 获取SMTP密码
            password: await configure.get('SMTP_PASSWORD', 'your-smtp-password'),
            // 获取SMTP安全连接
            secure: await configure.get<boolean>('SMTP_SECURE', false),
            // 获取SMTP发件人
            from: await configure.get('SMTP_FROM', undefined),
            // Email模板路径
            resource: resolve(__dirname, '../../assets/emails'),
        };
        // 如果SMTP发件人为空，则使用SMTP用户名
        if (isNil(config.from)) config.from = await configure.get('SMTP_FROM', config.user);
        // 获取SMTP端口
        config.port = config.secure
            ? await configure.get<number>('SMTP_PORT', 443)
            : await configure.get<number>('SMTP_PORT', 25);
        // 返回SMTP配置对象
        return config;
    },
    // 存储配置
    storage: true,
});
