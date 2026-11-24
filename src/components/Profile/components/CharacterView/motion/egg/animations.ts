import type { AnimName } from '../types';

export function applyEggAnimation(
  svg: SVGSVGElement,
  _anim: AnimName,
  t: number,
) {
  const root = svg.getElementById('root');
  if (!root) return;

  const bounce = Math.abs(Math.sin(t * 2.5));
  const lift = bounce * 48;
  const scaleX = 1 + bounce * 0.06;
  const scaleY = 1 - bounce * 0.06;

  root.setAttribute(
    'transform',
    `translate(0, ${-lift}) translate(512, 1024) scale(${scaleX}, ${scaleY}) translate(-512, -1024)`,
  );
}
