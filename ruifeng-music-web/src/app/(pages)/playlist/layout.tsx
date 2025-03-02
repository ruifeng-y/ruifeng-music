import { FC, PropsWithChildren, ReactNode } from 'react';

import { Header } from '@/app/_components/header';

const AppLayout: FC<PropsWithChildren<{ modal: ReactNode }>> = ({ children, modal }) => (
    <>
        <div className="tw-app-layout">
            <Header />
            {children}
        </div>
        {modal}
    </>
);
export default AppLayout;
