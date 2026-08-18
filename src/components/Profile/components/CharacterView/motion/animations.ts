export type AnimName = 'idle' | 'squat' | 'deadlift' | 'ohp';

export type AnimContext = {
  root: SVGGElement;
  barbellBack: SVGGElement;
  barbellFront: SVGGElement;
  wingL: SVGGElement | null;
  wingR: SVGGElement | null;
  legs: SVGGElement | null;
  toes: SVGGElement | null;
  flame: SVGGElement | null;
  feathers: SVGGElement | null;
  sweat: SVGGElement | null;
  t: number;
};

type AnimFn = (ctx: AnimContext) => void;

// ─── 유틸리티 ──────────────────────────────────────────────────

// 불사조 불꽃
const applyFlameFlicker = (flame: SVGGElement | null, t: number) => {
  if (!flame) return;

  const children = flame.children;
  if (children.length < 3) return;

  const outer = children[0] as SVGPathElement;
  const mid = children[1] as SVGPathElement;
  const inner = children[2] as SVGPathElement;

  // 시간 기반 움직임
  const time = t * 7;

  // 바깥 불꽃
  const outerX = Math.sin(time * 0.8) * 5;
  const outerScaleY = 1 + Math.sin(time * 0.4) * 0.08;
  outer.setAttribute(
    'transform',
    `translate(${outerX}, 0) scale(1, ${outerScaleY})`,
  );

  // 중간 불꽃
  const midPhase = (Math.sin(time) + 1) / 2;
  const midY = -5 + midPhase * -20;
  const midScaleY = 0.9 + midPhase * 0.2;
  mid.setAttribute('transform', `translate(0, ${midY}) scale(1, ${midScaleY})`);

  // 안쪽 불꽃
  const innerPhase = (Math.sin(time * 1.3) + 1) / 2;
  const innerY = -10 + innerPhase * -35;
  const innerScaleY = 0.8 + innerPhase * 0.4;
  inner.setAttribute(
    'transform',
    `translate(0, ${innerY}) scale(1, ${innerScaleY})`,
  );

  const innerOpacity = 0.7 + Math.sin(time * 2) * 0.2;
  inner.setAttribute('opacity', String(innerOpacity));

  flame.setAttribute('transform', 'translate(0, 40)');
};

// 오골계 깃털
const applyFeatherFlutter = (feathers: SVGGElement | null, t: number) => {
  if (!feathers) return;

  Array.from(feathers.children).forEach((child) => {
    const feather = child as SVGGElement;
    const x = Number(feather.getAttribute('data-x')) || 0;
    const y = Number(feather.getAttribute('data-y')) || 0;
    const baseRot = Number(feather.getAttribute('data-rot')) || 0;
    const amp = Number(feather.getAttribute('data-amp')) || 1;
    const speed = Number(feather.getAttribute('data-speed')) || 1;
    const seed = Number(feather.getAttribute('data-seed')) || 0;

    const time = t * speed + seed;
    const cycle = 6;
    const progress = (((time % cycle) + cycle) % cycle) / cycle;

    // 몸통 중심 기준 바깥 방향
    const outwardAngle = ((baseRot - 90) * Math.PI) / 180;
    const outwardX = Math.cos(outwardAngle);

    // 좌우 확산
    const spreadRange = 25;
    const driftX =
      outwardX * progress * spreadRange * amp + Math.sin(time * 1.5) * 3 * amp;

    const riseRange = 35;
    const driftY = -progress * riseRange * amp;

    const opacity = 0.85 * (1 - progress * 0.7);
    const rotate = baseRot + Math.sin(time * 0.8) * 18 * amp;

    feather.setAttribute(
      'transform',
      `translate(${x + driftX}, ${y + driftY}) rotate(${rotate})`,
    );
    feather.setAttribute('opacity', String(opacity));
  });
};

// 땀
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
};

// ─── 개별 애니메이션 ───────────────────────────────────────────────

const idle: AnimFn = (ctx) => {
  const { root, barbellBack, barbellFront, flame, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '0');

  // 통통 튀는 바운스
  const speed = 2.5;
  const phase = Math.abs(Math.sin(t * speed));
  const bounceHeight = phase * 12;

  const scaleY = 0.94 + phase * 0.1;
  const scaleX = 1.06 - phase * 0.12;

  root.setAttribute(
    'transform',
    `translate(0, ${-bounceHeight}) scale(${scaleX}, ${scaleY})`,
  );

  applyFlameFlicker(flame, t);
};

// 스쿼트
const squat: AnimFn = (ctx) => {
  const {
    root,
    barbellBack,
    barbellFront,
    wingL,
    wingR,
    legs,
    toes,
    flame,
    feathers,
    sweat,
    t,
  } = ctx;
  barbellBack.setAttribute('opacity', '1');
  barbellFront.setAttribute('opacity', '0');

  const phase = (Math.sin(t * 2) + 1) / 2;
  const sqDepth = phase * 8;

  root.setAttribute('transform', `translate(0, ${-sqDepth * 0.4})`);
  legs?.setAttribute('transform', `translate(0, ${sqDepth})`);
  toes?.setAttribute('transform', `translate(0, ${sqDepth})`);

  wingL?.setAttribute('transform', `rotate(-40, -60, 20)`);
  wingR?.setAttribute('transform', `rotate(40, 60, 20)`);

  if (wingL) root.insertBefore(wingL, barbellBack);
  if (wingR) root.insertBefore(wingR, barbellBack);

  applyFlameFlicker(flame, t);
  applyFeatherFlutter(feathers, t);
  applySweat(sweat, t);
};

// 데드리프트
const deadlift: AnimFn = (ctx) => {
  const {
    root,
    barbellBack,
    barbellFront,
    wingL,
    wingR,
    legs,
    toes,
    flame,
    feathers,
    sweat,
    t,
  } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const phase = (Math.sin(t * 1.5 - Math.PI / 2) + 1) / 2;
  const barbY = (1 - phase) * 10 + 50;
  const dlDepth = phase * 8;

  root.setAttribute('transform', `translate(0, ${-dlDepth * 0.4})`);
  barbellFront.setAttribute('transform', `translate(0, ${barbY - 4})`);

  legs?.setAttribute('transform', `translate(0, ${dlDepth})`);
  toes?.setAttribute('transform', `translate(0, ${dlDepth})`);

  const wingOffsetY = barbY - 40;
  wingL?.setAttribute('transform', `translate(0, ${wingOffsetY})`);
  wingR?.setAttribute('transform', `translate(0, ${wingOffsetY})`);

  if (wingL) root.appendChild(wingL);
  if (wingR) root.appendChild(wingR);

  applyFlameFlicker(flame, t);
  applyFeatherFlutter(feathers, t);
  applySweat(sweat, t);
};

// OHP
const ohp: AnimFn = (ctx) => {
  const {
    root,
    barbellBack,
    barbellFront,
    wingL,
    wingR,
    legs,
    toes,
    flame,
    feathers,
    sweat,
    t,
  } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  root.appendChild(barbellFront);

  const phase = (Math.sin(t * 2) + 1) / 2;
  const barbY = (1 - phase) * 30 + -50;

  barbellFront.setAttribute('transform', `translate(0, ${barbY})`);

  const wingOffsetY = barbY - 10;
  wingL?.setAttribute('transform', `translate(0, ${wingOffsetY})`);
  wingR?.setAttribute('transform', `translate(0, ${wingOffsetY})`);

  legs?.setAttribute('transform', `translate(0, 5)`);
  toes?.setAttribute('transform', `translate(0, 5)`);

  applyFlameFlicker(flame, t);
  applyFeatherFlutter(feathers, t);
  applySweat(sweat, t);
};

// ─── 레지스트리 ────────────────────────────────────────────────────

export const ANIMATIONS: Record<AnimName, AnimFn> = {
  idle,
  squat,
  deadlift,
  ohp,
};

// ─── 진입점 ───────────────────────────────────────────────────────

export function applyAnim(svg: SVGSVGElement, anim: AnimName, t: number) {
  const root = svg.getElementById('root') as SVGGElement | null;
  const barbellBack = svg.getElementById('barbellBack') as SVGGElement | null;
  const barbellFront = svg.getElementById('barbellFront') as SVGGElement | null;
  if (!root || !barbellBack || !barbellFront) return;

  const elementsToReset = [root, barbellBack, barbellFront];
  const optionalIds = [
    'wingL',
    'wingR',
    'legs',
    'toes',
    'flame',
    'feathers',
    'sweat',
  ];

  optionalIds.forEach((id) => {
    const el = svg.getElementById(id);
    if (el) elementsToReset.push(el as SVGGElement);
  });

  elementsToReset.forEach((el) => el.setAttribute('transform', ''));

  const ctx: AnimContext = {
    root,
    barbellBack,
    barbellFront,
    wingL: svg.getElementById('wingL') as SVGGElement | null,
    wingR: svg.getElementById('wingR') as SVGGElement | null,
    legs: svg.getElementById('legs') as SVGGElement | null,
    toes: svg.getElementById('toes') as SVGGElement | null,
    flame: svg.getElementById('flame') as SVGGElement | null,
    feathers: svg.getElementById('feathers') as SVGGElement | null,
    sweat: svg.getElementById('sweat') as SVGGElement | null,
    t,
  };

  ANIMATIONS[anim](ctx);
}
