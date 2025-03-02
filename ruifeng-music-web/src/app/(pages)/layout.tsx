import { FC, PropsWithChildren, ReactNode } from 'react';

import { Header } from '../_components/header';
import { PlayerBar } from '@/app/_components/playerBar/playerBar';

const AppLayout: FC<PropsWithChildren<{ modal: ReactNode }>> = ({ children, modal }) => (
    <>
        <div className="tw-app-layout">
            <Header />
            {children}
            <PlayerBar />
        </div>
        {modal}
    </>
);
export default AppLayout;
