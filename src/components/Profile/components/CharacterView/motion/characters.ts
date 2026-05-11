import { AnimName } from './animations';

export type Character = {
  name: string;
  anims: AnimName[];
  render: (svg: SVGSVGElement) => void;
};

// ─── SVG 헬퍼 ─────────────────────────────────────────────────────

function el(tag: string, attrs: Record<string, string | number>) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
  return e;
}

// ─── 공통 렌더 유틸 ───────────────────────────────────────────────

/**
 * 눈 두 개와 눈썹 두 개를 렌더링합니다.
 * @param xL 왼쪽 눈 X 좌표
 * @param xR 오른쪽 눈 X 좌표
 * @param y  눈 Y 좌표
 */

function renderEyes(g: SVGGElement, xL: number, xR: number, y: number) {
  // 눈 색상
  const eyeColor = '#333';
  g.appendChild(el('circle', { cx: xL, cy: y - 1, r: 2, fill: eyeColor }));
  g.appendChild(el('circle', { cx: xR, cy: y - 1, r: 2, fill: eyeColor }));

  // ── 눈썹 ───────────────────────────

  // 눈썹 색상
  const browColor = eyeColor;
  const centerX = (xL + xR) / 2;
  const browY = y - 6;
  const browHeight = 3;
  const tilt = 1;

  const browGroup = el('g', {
    fill: 'none',
    stroke: browColor,
    'stroke-width': 2,
    'stroke-linecap': 'round',
  });

  const offset = 4.5;

  // 왼쪽 눈썹
  browGroup.appendChild(
    el('path', {
      d: `M${centerX - offset},${browY} L${centerX - offset - tilt},${browY - browHeight}`,
    }),
  );

  // 오른쪽 눈썹
  browGroup.appendChild(
    el('path', {
      d: `M${centerX + offset},${browY} L${centerX + offset + tilt},${browY - browHeight}`,
    }),
  );

  g.appendChild(browGroup);
}

// ── 바벨 ───────────────────────────

function renderBarbell(g: SVGGElement) {
  // 몸통 뒤
  const back = el('g', { id: 'barbellBack', opacity: 0 });

  // 바
  back.appendChild(
    el('rect', { x: -80, y: 0, width: 160, height: 6, rx: 3, fill: '#888' }),
  );

  // 왼쪽 원판
  back.appendChild(
    el('rect', { x: -73, y: -17, width: 18, height: 40, rx: 4, fill: '#555' }),
  );

  // 오른쪽 원판
  back.appendChild(
    el('rect', { x: 55, y: -17, width: 18, height: 40, rx: 4, fill: '#555' }),
  );
  g.insertBefore(back, g.firstChild);

  // 몸통 앞
  const front = el('g', { id: 'barbellFront', opacity: 0 });

  // 바
  front.appendChild(
    el('rect', { x: -80, y: 0, width: 160, height: 6, rx: 3, fill: '#888' }),
  );

  // 왼쪽 원판
  front.appendChild(
    el('rect', { x: -73, y: -17, width: 18, height: 40, rx: 4, fill: '#555' }),
  );

  // 오른쪽 원판
  front.appendChild(
    el('rect', { x: 55, y: -17, width: 18, height: 40, rx: 4, fill: '#555' }),
  );
  g.appendChild(front);
}

// ─── 개별 렌더 함수 ───────────────────────────────────────────────

// ── 달걀 ───────────────────────────
function renderEgg(svg: SVGSVGElement) {
  const g = el('g', { id: 'root' }) as SVGGElement;

  // 달걀 몸통 (타원)
  g.appendChild(
    el('ellipse', {
      cx: 0,
      cy: 10,
      rx: 35,
      ry: 45,
      fill: '#FDF5E6',
      stroke: '#E0C090',
      'stroke-width': 3,
    }),
  );

  // 눈
  renderEyes(g, -12, 12, 0);

  // 입
  g.appendChild(
    el('path', {
      d: 'M-5,10 Q0,15 5,10',
      fill: 'none',
      stroke: '#D0A060',
      'stroke-width': 2.5,
      'stroke-linecap': 'round',
    }),
  );

  // 바벨
  renderBarbell(g);

  svg.appendChild(g);
}

/**
 * 닭
 * @param crest  벼슬 표시 여부
 * @param wattle 육수 표시 여부
 * @param color  몸통 메인 색상
 * @param stroke 몸통 테두리 색상
 * @param isDark 어두운 색 계열 여부
 */

function renderChick(
  svg: SVGSVGElement,
  crest: boolean,
  wattle: boolean,
  color: string,
  isDark = false,
) {
  const g = el('g', { id: 'root' }) as SVGGElement;

  // ── 몸통 ──────────────────────────────────────────────────────
  g.appendChild(
    el('path', {
      d: `M0,-45
    C-21,-45 -42,-28 -44,0
    C-46,18 -44,34 -36,44
    C-28,54 -18,64 0,56
    C18,64 28,54 36,44
    C44,34 46,18 44,0
    C42,-28 22,-45 0,-45 Z`,
      fill: color,
    }),
  );

  // ── 날개 ──────────────────────────────────────────────────────
  const wingColor = isDark ? '#222' : '#F0A000';

  // 왼쪽 날개
  g.appendChild(
    el('path', {
      id: 'wingL',
      d: 'M-38,10 Q-50,25 -35,40',
      fill: 'none',
      stroke: wingColor,
      'stroke-width': 6,
      'stroke-linecap': 'round',
    }),
  );

  // 오른쪽 날개
  g.appendChild(
    el('path', {
      id: 'wingR',
      d: 'M38,10 Q50,25 35,40',
      fill: 'none',
      stroke: wingColor,
      'stroke-width': 6,
      'stroke-linecap': 'round',
    }),
  );

  // ── 벼슬  ─────────────────────────────────
  if (crest) {
    const crestColor = isDark ? '#BB0000' : '#FF4422';

    g.appendChild(el('circle', { cx: 0, cy: -50, r: 7, fill: crestColor }));
    g.appendChild(el('circle', { cx: -8, cy: -47, r: 6, fill: crestColor }));
    g.appendChild(el('circle', { cx: 8, cy: -47, r: 6, fill: crestColor }));
  }

  // ── 육수  ────────────────────────────────
  if (wattle) {
    const wattleColor = isDark ? '#BB0000' : '#FF4422';

    // 왼쪽 육수
    g.appendChild(
      el('ellipse', {
        cx: -2,
        cy: -5,
        rx: 3.5,
        ry: 5.5,
        fill: wattleColor,
        transform: 'rotate(15 -2 -5)',
      }),
    );

    // 오른쪽 육수
    g.appendChild(
      el('ellipse', {
        cx: 2,
        cy: -5,
        rx: 3.5,
        ry: 5.5,
        fill: wattleColor,
        transform: 'rotate(-15 2 -5)',
      }),
    );
  }

  // ── 얼굴 ──────────────────────────────────────────────────────

  // 눈
  renderEyes(g, -12, 12, -20);

  // 부리
  g.appendChild(
    el('path', {
      d: 'M-8,-11 L0,-16 L8,-11 Z',
      fill: '#f99004',
      stroke: '#f99004',
      'stroke-width': 3,
      'stroke-linejoin': 'round',
    }),
  );

  // ── 다리 ──────────────────────────────────────────────────────
  g.appendChild(
    el('path', {
      id: 'legs',
      d: 'M-10,50 L-10,60 M10,50 L10,60',
      stroke: '#ca7d13',
      'stroke-width': 4,
      'stroke-linecap': 'round',
    }),
  );

  // ── 발가락 ────────────────────────────────────────────────────
  g.appendChild(
    el('path', {
      id: 'toes',
      d: [
        'M-10,60 L-10,67 M-10,60 L-16,66 M-10,60 L-4,66 M10,60 L10,67 M10,60 L4,66 M10,60 L16,66',
      ].join(' '),
      stroke: '#ca7d13',
      'stroke-width': 3,
      'stroke-linecap': 'round',
    }),
  );

  renderBarbell(g);

  svg.appendChild(g);
}

// ── 불사조 ────────────────────────────────────────────────────
function renderPhoenix(svg: SVGSVGElement) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = el('defs', {}) as SVGDefsElement;
    if (svg.firstChild) svg.insertBefore(defs, svg.firstChild);
    else svg.appendChild(defs);
  }

  if (!svg.getElementById('flameBlur')) {
    const filter = el('filter', {
      id: 'flameBlur',
      x: '-50%',
      y: '-50%',
      width: '200%',
      height: '200%',
    });
    filter.appendChild(
      el('feGaussianBlur', {
        in: 'SourceGraphic',
        stdDeviation: '5',
        result: 'blur',
      }),
    );
    defs.appendChild(filter);
  }

  // 몸통
  renderChick(svg, false, true, '#FF3300');
  const root = svg.getElementById('root') as SVGGElement | null;
  if (!root) return;

  // 날개 색상 변경
  const wingL = svg.getElementById('wingL');
  const wingR = svg.getElementById('wingR');
  if (wingL) wingL.setAttribute('stroke', '#FFD700');
  if (wingR) wingR.setAttribute('stroke', '#FFD700');

  // 꼬리 깃털
  const tail = el('path', {
    d: 'M0,50 C-15,70 -10,85 0,90 C10,85 15,70 0,50 Z',
    fill: '#FF8800',
    stroke: '#FFCC00',
    'stroke-width': 2,
    transform: 'translate(40, -30) rotate(50, 0, 70)',
  });
  root.insertBefore(tail, root.firstChild);

  // 불꽃 효과
  const flameGroup = el('g', {
    id: 'flame',
    filter: 'url(#flameBlur)',
    opacity: 0.7,
  });
  const flamePath = (scaleX: number) => `
    M${-28 * scaleX},30 
    C${-45 * scaleX},35 ${-72 * scaleX},10 -55,-30 
    C-42,-60 -20,-85 50,-85 
    C20,-85 42,-60 55,-30 
    C${72 * scaleX},10 ${45 * scaleX},35 0,20 Z
  `;
  flameGroup.appendChild(el('path', { d: flamePath(1.1), fill: '#FF4400' }));
  flameGroup.appendChild(el('path', { d: flamePath(1), fill: '#FFD700' }));
  flameGroup.appendChild(el('path', { d: flamePath(0.8), fill: '#FFFFE0' }));
  flameGroup.setAttribute('transform', 'translate(0, 40)');

  root.insertBefore(flameGroup, root.firstChild);

  // 머리 깃털
  root.appendChild(
    el('path', {
      d: 'M0,-45 C5,-60 15,-65 20,-60 C15,-55 5,-50 0,-45 Z',
      fill: '#FFCC00',
      stroke: '#FF8800',
      'stroke-width': 2,
    }),
  );

  // 바벨
  const front = svg.getElementById('barbellFront');
  if (front) {
    root.appendChild(front);
    front.setAttribute('opacity', '1');
  }
}

// ─── 캐릭터 레지스트리 ────────────────────────────────────────────

export const CHARACTERS: Character[] = [
  {
    name: '달걀',
    anims: ['idle'],
    render: renderEgg,
  },
  {
    name: '병아리',
    anims: ['ohp', 'deadlift', 'squat'],

    render: (svg) => renderChick(svg, false, false, '#f4bd0e'),
  },
  {
    name: '병아리+벼슬',
    anims: ['ohp', 'deadlift', 'squat'],
    render: (svg) => renderChick(svg, true, false, '#f4bd0e'),
  },
  {
    name: '닭',
    anims: ['ohp', 'deadlift', 'squat'],
    render: (svg) => renderChick(svg, true, true, '#FFDD66'),
  },
  {
    name: '오골계',
    anims: ['ohp', 'deadlift', 'squat'],
    render: (svg) => renderChick(svg, true, true, '#555555', true),
  },
  {
    name: '불사조',
    anims: ['ohp', 'deadlift', 'squat'],
    render: renderPhoenix,
  },
];
