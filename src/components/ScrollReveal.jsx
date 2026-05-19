import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  triggerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  start,
  end,
  rotationEnd = 'bottom bottom',
  wordAnimationStart = 'top bottom-=20%',
  wordAnimationEnd = 'bottom bottom',
  scrub = true,
  wordStagger = 0.05,
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;
    const trigger =
      triggerRef && triggerRef.current
        ? triggerRef.current
        : el;
    const revealStart = start || wordAnimationStart;
    const revealEnd = end || wordAnimationEnd;

    let rotST;
    if (baseRotation !== 0) {
      rotST = ScrollTrigger.create({
        trigger,
        scroller,
        start: 'top bottom',
        end: rotationEnd,
        scrub,
        animation: gsap.fromTo(
          el,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          { ease: 'none', rotate: 0 }
        ),
      });
    } else {
      gsap.set(el, { rotate: 0 });
    }

    const wordElements = el.querySelectorAll('.word');

    const opacityST = ScrollTrigger.create({
      trigger,
      scroller,
      start: revealStart,
      end: revealEnd,
      scrub,
      animation: gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity' },
        { ease: 'none', opacity: 1, stagger: wordStagger }
      ),
    });

    let blurST;
    if (enableBlur) {
      blurST = ScrollTrigger.create({
        trigger,
        scroller,
        start: revealStart,
        end: revealEnd,
        scrub,
        animation: gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          { ease: 'none', filter: 'blur(0px)', stagger: wordStagger }
        ),
      });
    }

    return () => {
      rotST?.kill();
      opacityST.kill();
      blurST?.kill();
    };
  }, [
    scrollContainerRef,
    triggerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    start,
    end,
    rotationEnd,
    wordAnimationStart,
    wordAnimationEnd,
    blurStrength,
    scrub,
    wordStagger,
  ]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <span className={`scroll-reveal-text ${textClassName}`}>{splitText}</span>
    </div>
  );
};

export default ScrollReveal;
