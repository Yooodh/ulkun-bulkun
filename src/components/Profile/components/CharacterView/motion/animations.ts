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

// ─── 개별 애니메이션 ───────────────────────────────────────────────

const idle: AnimFn = (ctx) => {
  const { barbellBack, barbellFront, flame, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '0');

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
    t,
  } = ctx;
  barbellBack.setAttribute('opacity', '1');
  barbellFront.setAttribute('opacity', '0');

  const phase = (Math.sin(t * 2) + 1) / 2;
  const sqDepth = phase * 8;

  root.setAttribute('transform', `translate(0, ${-sqDepth * 0.4})`);
  legs?.setAttribute('transform', `translate(0, ${sqDepth})`);
  toes?.setAttribute('transform', `translate(0, ${sqDepth})`);

  barbellBack.setAttribute('transform', '');
  wingL?.setAttribute('transform', `rotate(-40, -60, 20)`);
  wingR?.setAttribute('transform', `rotate(40, 60, 20)`);

  applyFlameFlicker(flame, t);
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
    t,
  } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const phase = (Math.sin(t * 1.5 - Math.PI / 2) + 1) / 2;
  const barbY = (1 - phase) * 10 + 50;
  const dlDepth = phase * 8;

  root.setAttribute('transform', `translate(0, ${-dlDepth * 0.4})`);
  barbellFront.setAttribute('transform', `translate(0, ${barbY})`);

  legs?.setAttribute('transform', `translate(0, ${dlDepth})`);
  toes?.setAttribute('transform', `translate(0, ${dlDepth})`);

  const wingOffsetY = barbY - 40;
  wingL?.setAttribute('transform', `translate(0, ${wingOffsetY})`);
  wingR?.setAttribute('transform', `translate(0, ${wingOffsetY})`);

  applyFlameFlicker(flame, t);
};

// OHP
const ohp: AnimFn = (ctx) => {
  const { barbellBack, barbellFront, wingL, wingR, flame, t } = ctx;
  barbellBack.setAttribute('opacity', '0');
  barbellFront.setAttribute('opacity', '1');

  const phase = (Math.sin(t * 2) + 1) / 2;
  const barbY = (1 - phase) * 30 + -50;

  barbellFront.setAttribute('transform', `translate(0, ${barbY})`);

  const wingOffsetY = barbY - 10;
  wingL?.setAttribute('transform', `translate(0, ${wingOffsetY})`);
  wingR?.setAttribute('transform', `translate(0, ${wingOffsetY})`);

  applyFlameFlicker(flame, t);
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

  // 초기화
  const elementsToReset = [root, barbellBack, barbellFront];
  const optionalIds = ['wingL', 'wingR', 'legs', 'toes', 'flame']; // flame 추가

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
    t,
  };

  ANIMATIONS[anim](ctx);
}
