import { CX, GRIP_Y, FLOOR_Y, PIVOT_L, PIVOT_R } from './render';

import type { AnimName, AnimContext } from '../types';

type AnimFn = (ctx: AnimContext) => void;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const squash = (dx: number, dy: number, sx: number, sy: number) =>
  `translate(${dx}, ${dy}) translate(${CX}, ${FLOOR_Y}) scale(${sx}, ${sy}) translate(${-CX}, ${-FLOOR_Y})`;

const rot = (deg: number, p: { x: number; y: number }) =>
  `rotate(${deg}, ${p.x}, ${p.y})`;

const effects = (_ctx: AnimContext) => {};

const applySweat = (sweat: SVGGElement | null, t: number) => {
  if (!sweat) return;

  Array.from(sweat.children).forEach((child) => {
    const drop = child as SVGGElement;
    const x = Number(drop.getAttribute('data-x')) || 0;
    const y = Number(drop.getAttribute('data-y')) || 0;
    const rot = Number(drop.getAttribute('data-rot')) || 0;
    const size = Number(drop.getAttribute('data-size')) || 1;
    const seed = Number(drop.getAttribute('data-seed')) || 0;

    const time = t * 2.5 + seed;
    const cycle = 2.2;
    const progress = (((time % cycle) + cycle) % cycle) / cycle;

    let opacity = 0;
    let scale = size;
    let riseY = 0;

    if (progress < 0.12) {
      const p = progress / 0.12;
      opacity = p;
      scale = size * (0.5 + p * 0.5);
    } else if (progress < 0.55) {
      opacity = 1;
      scale = size;
      riseY = Math.sin((progress - 0.12) * 20) * 0.6;
    } else {
      const p = (progress - 0.55) / 0.45;
      opacity = 1 - p;
      scale = size * (1 + p * 0.2);
      riseY = -p * 10;
    }

    drop.setAttribute(
      'transform',
      `translate(${x}, ${y + riseY}) rotate(${rot}) scale(${scale})`,
    );
    drop.setAttribute('opacity', String(Math.max(0, opacity)));
  });

  sweat.parentElement?.appendChild(sweat);
};

const idle: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '0');

  const phase = Math.abs(Math.sin(t * 2.5));
  const sx = 1.04 - phase * 0.08;
  const sy = 0.95 + phase * 0.08;
  root.setAttribute('transform', squash(0, -phase * 50, sx, sy));
  effects(ctx);
};
const squat: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, legs, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '1');
  barbellFront.setAttribute('opacity', '0');

  const p = (Math.sin(t * 2) + 1) / 2;
  root.setAttribute('transform', squash(0, 0, 1 + 0.02 * p, 1 - 0.1 * p));
  legs?.setAttribute('transform', `translate(0, ${-35 * p})`);

  const body = root.querySelector('#body');
  if (wingL) root.appendChild(wingL);
  if (wingR) root.appendChild(wingR);
  root.appendChild(barbellBack);
  if (body) root.appendChild(body);
  barbellBack.setAttribute('transform', `translate(0, ${-110})`);

  wingL?.setAttribute(
    'transform',
    `translate(0, 40) translate(${PIVOT_L.x}, ${PIVOT_L.y}) rotate(-55) scale(1, -1) translate(${-PIVOT_L.x}, ${-PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(0, 40) translate(${PIVOT_R.x}, ${PIVOT_R.y}) rotate(55) scale(1, -1) translate(${-PIVOT_R.x}, ${-PIVOT_R.y})`,
  );
  applySweat(sweat, t);
  effects(ctx);
};

const deadlift: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, legs, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const p = (Math.sin(t * 1.5 - Math.PI / 2) + 1) / 2;
  const barY = lerp(805, 700, p);
  const dy = barY - GRIP_Y;

  barbellFront.setAttribute('transform', `translate(0, ${dy + 40})`);
  wingL?.setAttribute(
    'transform',
    `translate(60, ${dy}) rotate(-18, ${PIVOT_L.x}, ${PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(-60, ${dy}) rotate(18, ${PIVOT_R.x}, ${PIVOT_R.y})`,
  );

  root.setAttribute(
    'transform',
    squash(0, 0, lerp(1.04, 1, p), lerp(0.93, 1, p)),
  );
  legs?.setAttribute('transform', `translate(0, ${-15 * (1 - p)})`);
  applySweat(sweat, t);

  effects(ctx);
};

const ohp: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const p = (Math.sin(t * 2) + 1) / 2;
  const barY = lerp(570, 320, p);
  const dy = barY - GRIP_Y;
  const wingDy = dy + 120;

  root.appendChild(barbellFront);
  barbellFront.setAttribute('transform', `translate(0, ${dy - 40})`);
  wingL?.setAttribute(
    'transform',
    `translate(0, ${wingDy}) translate(${PIVOT_L.x}, ${PIVOT_L.y}) scale(1, -1) translate(${-PIVOT_L.x}, ${-PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(0, ${wingDy}) translate(${PIVOT_R.x}, ${PIVOT_R.y}) scale(1, -1) translate(${-PIVOT_R.x}, ${-PIVOT_R.y})`,
  );

  root.setAttribute(
    'transform',
    squash(0, 0, lerp(1.02, 0.97, p), lerp(0.97, 1.03, p)),
  );
  applySweat(sweat, t);
  effects(ctx);
};

export const ANIMATIONS_PARTS: Record<AnimName, AnimFn> = {
  idle,
  squat,
  deadlift,
  ohp,
};

export function applyChickPartsAnimation(
  svg: SVGSVGElement,
  anim: AnimName,
  t: number,
) {
  const g = (id: string) => svg.getElementById(id) as SVGGElement | null;

  const root = g('root');
  const barbellBack = g('barbellBack');
  const barbellFront = g('barbellFront');
  if (!root || !barbellBack || !barbellFront) return;

  const body = svg.getElementById('body');
  const wingL = g('wingL');
  const wingR = g('wingR');

  [barbellBack, body, barbellFront, wingL, wingR].forEach((part) => {
    if (part) root.appendChild(part);
  });

  [
    'root',
    'barbellBack',
    'barbellFront',
    'wingL',
    'wingR',
    'legs',
    'toes',
    'flame',
    'feathers',
  ]
    .map(g)
    .forEach((e) => e?.setAttribute('transform', ''));

  ANIMATIONS_PARTS[anim]({
    root,
    barbellBack,
    barbellFront,
    wingL: g('wingL'),
    wingR: g('wingR'),
    legs: g('legs'),
    toes: g('toes'),
    flame: g('flame'),
    feathers: g('feathers'),
    sweat: g('sweat'),
    t,
  });
}
