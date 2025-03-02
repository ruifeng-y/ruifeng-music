import { FC } from 'react';
import { List } from '@/app/_components/playlist/playlist';

import $styles from './songList.module.css';
export const SongList: FC = () => {
    return (
        <div className={$styles.container}>
            <div className={$styles.title}>title</div>
            <List />
        </div>
    );
};
