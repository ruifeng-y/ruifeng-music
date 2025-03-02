import { FC } from 'react';
import Image from 'next/image';
import { FaPlay } from 'react-icons/fa'; // 导入播放图标

import $styles from './playlist.module.css';

interface SongItem {
    id: number;
    name: string;
    pic: string;
}

export const List: FC<{ props: SongItem[] }> = (props) => {
    const songList = props.props;
    // console.log("调用 songList",songList);
    return (
        <div className={$styles.divBox}>
            {/* 设定响应式网格布局 */}
            <ul className={$styles.ul}>
                {/* 图片及名称的容器 */}
                {songList.map((item) => (
                    <li key={item.id} className={$styles.li}>
                        {/* 图片容器，使用 group 类以便应用悬浮效果 */}
                        {/* <div className={$styles.imgBox}> */}
                        <div className="tw-relative tw-w-full tw-aspect-square tw-overflow-hidden tw-group">
                            {/* 图片 */}
                            <Image
                                // src={`https://img1.baidu.com/it/u=866698258,2027745967&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=1067`}
                                src={process.env.IMAGE_HOST + item.pic}
                                // src={`https://n.sinaimg.cn/ent/4_img/upload/1f0ce517/160/w1024h1536/20210413/f3cc-knqqqmv1022303.jpg`}
                                alt={item.name}
                                layout="fill"
                                objectFit="cover"
                                className={
                                    'tw-transition-transform tw-duration-300 group-hover:tw-scale-110'
                                } // 放大效果
                                // className={$styles.img} // 放大效果
                            />
                            {/* 鼠标悬浮时显示的播放图标 */}
                            {/* <div className={$styles.playBox}> */}
                            <div className="tw-absolute tw-inset-0 tw-flex tw-justify-center tw-items-center tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-duration-300">
                                <div className={$styles.playIconBox}>
                                    <FaPlay className={$styles.playIcon} />
                                </div>
                            </div>
                        </div>
                        {/* 图片下方的名称 */}
                        <div className={$styles.imgName}>{item.name}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
