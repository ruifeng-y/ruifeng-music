import { FC, PropsWithChildren, ReactNode } from 'react';

import { Header } from '../_components/header';
import { PlayerBar } from '@/app/_components/playerBar/playerBar';

const AppLayout: FC<PropsWithChildren<{ modal?: ReactNode }>> = ({ children, modal }) => (
    <>
        <div className="tw-global-layout">
            <Header />
            <main className="tw-container tw-mx-auto tw-p-0 tw-flex tw-flex-col tw-h-full">
                {children}
            </main>
            <PlayerBar />
        </div>
        {modal}
    </>
);

export default AppLayout;
