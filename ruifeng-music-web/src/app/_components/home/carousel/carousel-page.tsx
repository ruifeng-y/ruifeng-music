import { FC } from 'react';

import EmblaCarousel from '@/app/_components/home/carousel/js/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
// import Header from '@/app/_components/home/carousel/js/Header';
// import Footer from '@/app/_components/home/carousel/js/Footer';

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

// import '@/app/_components/home/carousel/css/base.css';
// import '@/app/_components/home/carousel/css/sandbox.css';
// import '@/app/_components/home/carousel/css/embla.css';

import $styles from './carousel-page.module.css';

export const CarouselHome: FC = () => {
    return (
        <div className="tw-w-full tw-h-screen">
            {/* <Header /> */}
            <EmblaCarousel slides={SLIDES} options={OPTIONS} />
            {/* <Footer /> */}
        </div>
    );
};
