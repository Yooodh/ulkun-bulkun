import { CX, FLOOR_Y, GRIP_Y, PIVOT_L, PIVOT_R } from './render';

import type { AnimContext, AnimName } from '../types';

type AnimFn = (ctx: AnimContext) => void;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const squash = (sy: number, sx = 1) =>
  `translate(${CX}, ${FLOOR_Y}) scale(${sx}, ${sy}) translate(${-CX}, ${-FLOOR_Y})`;

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
      `translate(${x}, ${y + riseY}) rotate(${rot}) scale(-1, 1) scale(${scale})`,
    );
    drop.setAttribute('opacity', String(Math.max(0, opacity)));
  });

  sweat.parentElement?.appendChild(sweat);
};

const idle: AnimFn = (ctx) => {
  ctx.barbellBack.setAttribute('opacity', '0');
  ctx.barbellFront.setAttribute('opacity', '0');
  const p = Math.abs(Math.sin(ctx.t * 2.5));
  ctx.root.setAttribute('transform', squash(0.96 + p * 0.04, 1.02 - p * 0.04));
};

const squat: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, legs, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '1');
  barbellFront.setAttribute('opacity', '0');

  const p = (Math.sin(t * 2) + 1) / 2;
  root.setAttribute('transform', squash(1 - 0.08 * p, 1 + 0.02 * p));
  legs?.setAttribute('transform', `translate(0, ${-28 * p})`);

  const body = root.querySelector('#body');
  if (wingL) root.appendChild(wingL);
  if (wingR) root.appendChild(wingR);
  root.appendChild(barbellBack);
  if (body) root.appendChild(body);
  barbellBack.setAttribute('transform', 'translate(0, -220)');

  wingL?.setAttribute(
    'transform',
    `translate(-90, 10) translate(${PIVOT_L.x}, ${PIVOT_L.y}) rotate(-42) scale(1, -1) translate(${-PIVOT_L.x}, ${-PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(90, 10) translate(${PIVOT_R.x}, ${PIVOT_R.y}) rotate(42) scale(1, -1) translate(${-PIVOT_R.x}, ${-PIVOT_R.y})`,
  );
  applySweat(sweat, t);
};

const deadlift: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, legs, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const p = (Math.sin(t * 1.5 - Math.PI / 2) + 1) / 2;
  const barY = lerp(840, GRIP_Y - 20, p);
  const dy = barY - GRIP_Y;
  barbellFront.setAttribute('transform', `translate(0, ${dy})`);
  wingL?.setAttribute(
    'transform',
    `translate(0, ${dy}) rotate(-10, ${PIVOT_L.x}, ${PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(0, ${dy}) rotate(10, ${PIVOT_R.x}, ${PIVOT_R.y})`,
  );
  root.setAttribute('transform', squash(lerp(0.93, 1, p), lerp(1.03, 1, p)));
  legs?.setAttribute('transform', `translate(0, ${-12 * (1 - p)})`);
  applySweat(sweat, t);
};

const ohp: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, wingL, wingR, sweat, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const p = (Math.sin(t * 2) + 1) / 2;
  const barY = lerp(510, 320, p);
  const dy = barY - GRIP_Y;
  const wingDy = dy + 2 * (GRIP_Y - PIVOT_L.y);
  root.appendChild(barbellFront);
  barbellFront.setAttribute('transform', `translate(0, ${dy})`);
  wingL?.setAttribute(
    'transform',
    `translate(-100, ${wingDy}) translate(${PIVOT_L.x}, ${PIVOT_L.y}) scale(1, -1) translate(${-PIVOT_L.x}, ${-PIVOT_L.y})`,
  );
  wingR?.setAttribute(
    'transform',
    `translate(100, ${wingDy}) translate(${PIVOT_R.x}, ${PIVOT_R.y}) scale(1, -1) translate(${-PIVOT_R.x}, ${-PIVOT_R.y})`,
  );
  root.setAttribute(
    'transform',
    squash(lerp(0.98, 1.02, p), lerp(1.01, 0.98, p)),
  );
  applySweat(sweat, t);
};

const animations: Record<AnimName, AnimFn> = { idle, squat, deadlift, ohp };

export function applyChickenAnimation(
  svg: SVGSVGElement,
  anim: AnimName,
  t: number,
) {
  const get = (id: string) => svg.getElementById(id) as SVGGElement | null;
  const root = get('root');
  const barbellBack = get('barbellBack');
  const barbellFront = get('barbellFront');
  if (!root || !barbellBack || !barbellFront) return;

  const body = svg.getElementById('body');
  const wingL = get('wingL');
  const wingR = get('wingR');
  [barbellBack, body, barbellFront, wingL, wingR].forEach((part) => {
    if (part) root.appendChild(part);
  });
  [root, barbellBack, barbellFront, wingL, wingR, get('legs')].forEach((part) =>
    part?.setAttribute('transform', ''),
  );

  animations[anim]({
    root,
    barbellBack,
    barbellFront,
    wingL,
    wingR,
    legs: get('legs'),
    toes: null,
    flame: null,
    feathers: null,
    sweat: get('sweat'),
    t,
  });
}
