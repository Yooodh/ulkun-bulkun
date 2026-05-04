'use client';

import { useEffect, useRef } from 'react';

import { CHARACTERS } from './motion/characters';
import { AnimName, applyAnim } from './motion/animations';

function getCharacterIndex(totalPR: number): number {
  if (totalPR < 100) return 0;
  if (totalPR < 200) return 1;
  if (totalPR < 300) return 2;
  if (totalPR < 400) return 3;
  if (totalPR < 500) return 4;
  return 5;
}

type CanvasProps = {
  totalPR: number;
};

export default function Canvas({ totalPR }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const animNameRef = useRef<AnimName>('idle');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    tRef.current = 0;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const stageIndex = getCharacterIndex(totalPR);
    const { render, anims } = CHARACTERS[stageIndex];

    animNameRef.current = anims[Math.floor(Math.random() * anims.length)];
    render(svg);

    let last = performance.now();
    const tick = (now: number) => {
      tRef.current += (now - last) / 1000;
      last = now;
      applyAnim(svg, animNameRef.current, tRef.current);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [totalPR]);

  return (
    <svg
      ref={svgRef}
      viewBox='-80 -100 160 220'
      style={{ width: '100%', height: '100%' }}
    />
  );
}
