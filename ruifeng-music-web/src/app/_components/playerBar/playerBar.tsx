"use client"
// components/PlayerBar.tsx
import React, { useState, ChangeEvent } from 'react';
import { PlayIcon, DocumentTextIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon, MusicalNoteIcon, QueueListIcon } from '@heroicons/react/24/outline';

interface Song {
  title: string;
  artist: string;
  imageUrl: string;
  duration: number; // duration in seconds
}

export const PlayerBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [song] = useState<Song>({
    title: 'Song Title',
    artist: 'Artist Name',
    imageUrl: 'https://via.placeholder.com/60',
    duration: 240, // 4 minutes
  });

  // 播放/暂停控制
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 下一曲
  const handleNext = () => {
    console.log('Next song');
  };

  // 上一曲
  const handlePrevious = () => {
    console.log('Previous song');
  };

  // 进度条拖动
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  // 打开歌词
  const handleOpenLyrics = () => {
    console.log('Open Lyrics');
  };

  // 打开播放列表
  const handleOpenPlaylist = () => {
    console.log('Open Playlist');
  };

  return (
    // 主容器：固定在底部，深灰色背景，白色文字，内边距响应式，阴影，全宽
    <div className="tw-fixed tw-bottom-0 tw-bg-gray-800 tw-text-white tw-p-2 md:tw-p-4 tw-shadow-lg tw-w-full">
      {/* 内容布局：响应式flex布局，居中对齐，两端对齐，最大宽度，自动边距，间距响应式 */}
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-max-w-7xl tw-mx-auto tw-gap-4 md:tw-gap-0">
        {/* 左侧区域 - 歌曲图片、标题、艺术家 */}
        <div className="tw-flex tw-items-center tw-space-x-4 tw-w-full md:tw-w-auto">
          {/* 歌曲封面：响应式尺寸，圆角，覆盖适配 */}
          <img src={song.imageUrl} alt={song.title} className="tw-w-12 tw-h-12 md:tw-w-16 md:tw-h-16 tw-rounded-md tw-object-cover" />
          <div>
            {/* 歌曲标题：响应式文字大小，加粗 */}
            <h3 className="tw-text-base md:tw-text-lg tw-font-semibold">{song.title}</h3>
            {/* 艺术家名：响应式文字大小，灰色 */}
            <p className="tw-text-xs md:tw-text-sm tw-text-gray-400">{song.artist}</p>
          </div>
        </div>

        {/* 中间区域 - 播放/暂停、上一首/下一首、进度条 */}
        <div className="tw-flex tw-items-center tw-space-x-2 md:tw-space-x-4 tw-w-full md:tw-w-auto tw-justify-center">
          {/* 上一首按钮：响应式大小，圆形，悬停效果 */}
          <button onClick={handlePrevious} className="tw-text-lg md:tw-text-xl tw-p-1 md:tw-p-2 tw-rounded-full hover:tw-bg-gray-600">
            <ChevronLeftIcon className="tw-h-5 tw-w-5 md:tw-h-6 md:tw-w-6" />
          </button>
          {/* 播放/暂停按钮：响应式大小，圆形，悬停效果 */}
          <button onClick={togglePlayPause} className="tw-text-xl md:tw-text-2xl tw-p-1 md:tw-p-2 tw-rounded-full hover:tw-bg-gray-600">
            {isPlaying ? (
              <PauseIcon className="tw-h-6 tw-w-6 md:tw-h-8 md:tw-w-8" />
            ) : (
              <PlayIcon className="tw-h-6 tw-w-6 md:tw-h-8 md:tw-w-8" />
            )}
          </button>
          {/* 下一首按钮：响应式大小，圆形，悬停效果 */}
          <button onClick={handleNext} className="tw-text-lg md:tw-text-xl tw-p-1 md:tw-p-2 tw-rounded-full hover:tw-bg-gray-600">
            <ChevronRightIcon className="tw-h-5 tw-w-5 md:tw-h-6 md:tw-w-6" />
          </button>

          {/* 进度条：响应式宽度，水平边距 */}
          <input
            type="range"
            min="0"
            max={song.duration}
            value={currentTime}
            onChange={handleSeek}
            className="tw-w-32 md:tw-w-48 tw-mx-2 md:tw-mx-4"
          />
        </div>

        {/* 右侧区域 - 歌词、播放列表按钮 */}
        <div className="tw-flex tw-items-center tw-space-x-2 md:tw-space-x-4 tw-w-full md:tw-w-auto tw-justify-end">
          {/* 歌词按钮：响应式文字和图标大小，flex布局 */}
          <button onClick={handleOpenLyrics} className="tw-text-base md:tw-text-lg tw-flex tw-items-center tw-gap-1">
            <DocumentTextIcon className="tw-w-4 tw-h-4 md:tw-w-5 md:tw-h-5" />
            {/* 在移动端隐藏文字 */}
            <span className="hidden md:inline">歌词</span>
          </button>
          {/* 播放列表按钮：响应式文字和图标大小，flex布局 */}
          <button onClick={handleOpenPlaylist} className="tw-text-base md:tw-text-lg tw-flex tw-items-center tw-gap-1">
            <QueueListIcon className="tw-w-4 tw-h-4 md:tw-w-5 md:tw-h-5" />
            {/* 在移动端隐藏文字 */}
            <span className="hidden md:inline">播放列表</span>
          </button>
        </div>
      </div>
    </div>
  );
};
// export default PlayerBar;
