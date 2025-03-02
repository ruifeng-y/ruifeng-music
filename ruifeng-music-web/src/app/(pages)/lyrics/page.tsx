"use client"

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const LyricsPage: React.FC = () => {
  // 模拟歌词数据
  const lyrics = [
    { time: 0, text: "第一句歌词..." },
    { time: 30, text: "第二句歌词..." },
    { time: 60, text: "第三句歌词..." },
    // 更多歌词...
  ];

  // 收起页面处理函数
  const handleCollapse = () => {
    // 处理收起逻辑
    console.log('收起页面');
  };

  return (
    <div className="tw-min-h-screen tw-bg-gray-100 tw-flex tw-items-center tw-justify-center">
      {/* 收起按钮 */}
      <div className="tw-absolute tw-top-4 tw-left-4">
        <button 
          onClick={handleCollapse}
          className="tw-p-2 tw-rounded-full hover:tw-bg-gray-200 tw-transition-colors"
        >
          <ChevronDownIcon className="tw-h-6 tw-w-6 tw-text-gray-600" />
        </button>
      </div>

      {/* 主要内容区域 */}
      <div className="tw-container tw-mx-auto tw-px-4">
        <div className="tw-flex tw-justify-center tw-items-center tw-gap-12">
          {/* 左侧歌曲信息 */}
          <div className="tw-w-1/3 tw-flex tw-flex-col tw-items-center">
            <div className="tw-relative tw-w-64 tw-h-64 tw-mb-6">
              <Image
                src="https://via.placeholder.com/256"
                alt="专辑封面"
                fill
                className="tw-rounded-lg tw-shadow-lg"
                objectFit="cover"
              />
            </div>
          </div>

          {/* 右侧歌词展示 */}
          <div className="tw-w-1/2">
          <h1 className="tw-text-2xl tw-font-bold tw-mb-2">歌曲标题</h1>
          <p className="tw-text-gray-600">歌手名称</p>
            <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-8">
              {lyrics.map((line, index) => (
                <p 
                  key={index} 
                  className="tw-mb-4 tw-text-lg tw-text-gray-800 hover:tw-text-blue-600 tw-transition-colors tw-cursor-pointer"
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsPage;
