import { useEffect, useMemo, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { PLANETS } from '../data/planets';

const REVEAL_PROPS = {
  baseOpacity: 0.05,
  enableBlur: true,
  baseRotation: 0,
  blurStrength: 8,
  scrub: 1.5,
  wordStagger: 0,
  start: 'top center+=25%',
  end: 'bottom center-=10%',
};

function domRef(id) {
  return {
    get current() {
      return document.getElementById(id);
    },
  };
}

function useLevel3Content() {
  const [state, setState] = useState({ planetIndex: 0, version: 0, active: false });

  useEffect(() => {
    const onChange = (event) => {
      const planetIndex = event?.detail?.planetIndex ?? 0;
      setState((prev) => ({
        planetIndex,
        version: prev.version + 1,
        active: true,
      }));
    };

    window.addEventListener('l3-content-change', onChange);
    return () => window.removeEventListener('l3-content-change', onChange);
  }, []);

  return state;
}

function useLevel3Refs(anchorId) {
  return useMemo(() => ({
    scrollContainerRef: domRef('scroll-manager-container'),
    triggerRef: domRef(anchorId),
  }), [anchorId]);
}

function L3ScrollReveal({ anchorId, textClassName, children }) {
  const refs = useLevel3Refs(anchorId);

  return (
    <ScrollReveal
      {...REVEAL_PROPS}
      scrollContainerRef={refs.scrollContainerRef}
      triggerRef={refs.triggerRef}
      textClassName={textClassName}
    >
      {children}
    </ScrollReveal>
  );
}

export default function Level3TextReveals({ slot }) {
  const { planetIndex, version, active } = useLevel3Content();
  const planet = PLANETS[planetIndex] ?? PLANETS[0];
  const data = planet?.narrativeL3;

  if (!active || !data) return null;

  const ch3Scene = Array.isArray(data.ch3) ? data.ch3[0] : data.ch3;
  const ch3Mood = Array.isArray(data.ch3) ? data.ch3[1] : '';
  const key = `${planetIndex}-${version}`;

  if (slot === 'ch1') {
    return (
      <L3ScrollReveal key={`${key}-ch1`} anchorId="l3-scroll-anchor-ch1" textClassName="l3-s1-body">
        {data.ch1 || ''}
      </L3ScrollReveal>
    );
  }

  if (slot === 'ch2') {
    return (
      <L3ScrollReveal key={`${key}-ch2`} anchorId="l3-scroll-anchor-ch2" textClassName="focus-text-area__body">
        {data.ch2 || ''}
      </L3ScrollReveal>
    );
  }

  if (slot === 'ch3') {
    return (
      <>
        <p className="l3-chapter-label l3-s3-ch-label">CHAPTER III · 消亡</p>
        <L3ScrollReveal key={`${key}-ch3-scene`} anchorId="l3-scroll-anchor-ch3-scene" textClassName="l3-s3-body l3-s3-body--scene">
          {ch3Scene || ''}
        </L3ScrollReveal>
        {ch3Mood ? (
          <L3ScrollReveal key={`${key}-ch3-mood`} anchorId="l3-scroll-anchor-ch3-mood" textClassName="l3-s3-body l3-s3-body--mood">
            {ch3Mood}
          </L3ScrollReveal>
        ) : null}
      </>
    );
  }

  if (slot === 'ch4') {
    const ch4Paragraphs = Array.isArray(data.ch4)
      ? data.ch4.filter(Boolean)
      : [data.ch4 || ''];
    return (
      <>
        <p className="l3-chapter-label l3-s4-ch-label">CHAPTER IV · 怀念</p>
        {ch4Paragraphs.map((text, idx) => (
          <L3ScrollReveal
            key={`${key}-ch4-${idx}`}
            anchorId={idx === 0 ? 'l3-scroll-anchor-ch4' : 'l3-scroll-anchor-ch4-final'}
            textClassName="l3-s4-body"
          >
            {text}
          </L3ScrollReveal>
        ))}
      </>
    );
  }

  return null;
}
