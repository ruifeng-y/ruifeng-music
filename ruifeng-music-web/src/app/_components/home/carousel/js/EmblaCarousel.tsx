'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType
} from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import { DotButton, useDotButton } from './EmblaCarouselDotButton'

import $styles from '../carousel-page.module.css';

/**
 * 这定义了一个常量 TWEEN_FACTOR_BASE，它用作调整过渡动画的强度，在此代码中，它与轮播滑动的平滑度和动画效果有关。
 */
const TWEEN_FACTOR_BASE = 0.84

/**
 * 这是一个辅助函数，确保传入的 number 在指定的范围 [min, max] 内。也就是如果 number 小于 min，返回 min，如果大于 max，返回 max。
 * @param number 
 * @param min 
 * @param max 
 */
const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max)

/**
 * 定义了组件的 props 类型。slides 是一个包含数字的数组，每个数字代表一张幻灯片的索引或标识，options 是可选的配置对象，用于配置 Embla Carousel 的行为。
 */
type PropType = {
  slides: number[]
  options?: EmblaOptionsType
}

/**
 * 这是 React 函数组件。
 * 它接受 slides 和 options 作为 props。
 * 使用 useEmblaCarousel 钩子来初始化 Embla Carousel，
 * 并返回一个引用 (emblaRef) 和 Embla 的 API 实例 (emblaApi)。
 * useRef 用于保持对 tweenFactor 的引用，这个值控制过渡动画的平滑度。
 * @param props 
 */
const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const tweenFactor = useRef(0)

  // useDotButton：一个钩子，处理与轮播控制点（如小圆点）的相关逻辑。
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  // usePrevNextButtons：处理与上一张/下一张按钮的逻辑，包括禁用状态和点击事件。
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  // 该函数计算并设置 tweenFactor，它基于 Embla API 提供的 scrollSnapList 的长度来调整过渡效果。scrollSnapList 是所有可滚动的标记点。
  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }, [])

  const tweenOpacity = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine()
      // scrollProgress：表示当前滚动的位置。
      const scrollProgress = emblaApi.scrollProgress()
      // slidesInView：当前视窗内的幻灯片索引。
      const slidesInView = emblaApi.slidesInView()
      const isScrollEvent = eventName === 'scroll'

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress
        const slidesInSnap = engine.slideRegistry[snapIndex]

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target()

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress)
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress)
                }
              }
            })
          }

        //   const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current)
          // opacity：通过 tweenFactor 计算透明度，使用 numberWithinRange 保证透明度在 [0, 1] 范围内。
        //   const opacity = numberWithinRange(tweenValue, 0, 1).toString()
          const opacity = "1";
          emblaApi.slideNodes()[slideIndex].style.opacity = opacity
        })
      })
    },
    []
  )

  /**
   * 该函数计算并设置 tweenFactor，它基于 Embla API 提供的 scrollSnapList 的长度来调整过渡效果。scrollSnapList 是所有可滚动的标记点。
   */
  useEffect(() => {
    if (!emblaApi) return

    setTweenFactor(emblaApi)
    tweenOpacity(emblaApi)
    emblaApi
      .on('reInit', setTweenFactor)
      .on('reInit', tweenOpacity)
      .on('scroll', tweenOpacity)
      .on('slideFocus', tweenOpacity)
  }, [emblaApi, tweenOpacity])

  return (
    <div className={$styles.embla}>
      <div className={$styles.embla__viewport} ref={emblaRef}>
        <div className="embla__container">
          {slides.map((index) => (
            <div className={$styles.embla__slide} key={index}>
              <img
                className="embla__slide__img"
                src={`https://picsum.photos/600/350?v=${index}`}
                alt={`${index}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
