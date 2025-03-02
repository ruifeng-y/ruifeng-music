import { createUserConfig } from '@/modules/user/config';
/**
 * 该常量是通过调用createUserConfig函数并传递一个空对象作为参数来创建的。下面是对这段代码的详细解释：
 */
export const user = createUserConfig(() => ({}));