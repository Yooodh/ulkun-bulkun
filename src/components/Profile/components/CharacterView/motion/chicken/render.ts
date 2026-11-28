const NS = 'http://www.w3.org/2000/svg';

function el(tag: string, attrs: Record<string, string | number>) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) =>
    node.setAttribute(key, String(value)),
  );
  return node;
}

function part(href: string) {
  return el('image', { href, x: 0, y: 0, width: 1024, height: 1024 });
}

export const CX = 512;
export const GRIP_Y = 776;
export const FLOOR_Y = 840;
export const PIVOT_L = { x: 386, y: 650 };
export const PIVOT_R = { x: 638, y: 650 };

const BARBELL_W = 1052;
const BARBELL_H = 263;
const BARBELL_CENTER_Y = 132;

function barbell(id: 'barbellBack' | 'barbellFront', src: string) {
  const outer = el('g', { id, opacity: 0 });
  const inner = el('g', { transform: `translate(${CX}, ${GRIP_Y})` });
  inner.appendChild(
    el('image', {
      href: src,
      x: -BARBELL_W / 2,
      y: -BARBELL_CENTER_Y,
      width: BARBELL_W,
      height: BARBELL_H,
    }),
  );
  outer.appendChild(inner);
  return outer;
}

function renderSweatDrop(
  x: number,
  y: number,
  size: number,
  headX: number,
  headY: number,
  seed: number,
) {
  const dx = headX - x;
  const dy = headY - y;
  const rot = (Math.atan2(dy, dx) * 180) / Math.PI + 90;

  const group = el('g', {
    class: 'sweat-drop',
    'data-x': x,
    'data-y': y,
    'data-rot': rot,
    'data-size': size,
    'data-seed': seed.toFixed(2),
    transform: `translate(${x},${y}) rotate(${rot}) scale(-1, 1) scale(${size})`,
    opacity: 0,
  });

  group.appendChild(
    el('path', {
      d: 'M0,-7 C3,-5.5 3.5,-2 1.5,1.5 C0.5,3.5 -1.5,3 -1.5,1 C-1.5,-2 -1,-5 0,-7 Z',
      fill: '#8FD3F4',
    }),
  );

  return group;
}

function renderSweat(root: SVGGElement) {
  const sweat = el('g', { id: 'sweat', transform: 'translate(512, 450) scale(6.4)' });

  const headX = 0;
  const headY = -20;
  const xOffset = 1;
  const yOffset = 23;
  const drops = [
    { x: -(34 + xOffset), y: -58 + yOffset, size: 1, seed: 0 },
    { x: -(46 + xOffset), y: -66 + yOffset, size: 0.75, seed: 0.8 },
    { x: -(26 + xOffset), y: -70 + yOffset, size: 0.6, seed: 1.6 },
  ];

  drops.forEach((drop) => {
    sweat.appendChild(
      renderSweatDrop(
        drop.x,
        drop.y,
        drop.size,
        headX,
        headY,
        drop.seed,
      ),
    );
  });

  root.appendChild(sweat);
}

export function renderChicken(svg: SVGSVGElement) {
  const dir = '/chars/chicken';
  const sharedDir = '/chars/gym-equipment';
  svg.setAttribute('viewBox', '-120 -260 1264 1384');

  const legs = el('g', { id: 'legs' });
  legs.appendChild(part(`${dir}/feet.png`));
  svg.appendChild(legs);

  const root = el('g', { id: 'root' }) as SVGGElement;
  root.appendChild(barbell('barbellBack', `${sharedDir}/barbell-long.png`));

  const body = part(`${dir}/body.png`);
  body.setAttribute('id', 'body');
  root.appendChild(body);
  root.appendChild(barbell('barbellFront', `${sharedDir}/barbell-long.png`));

  const wingL = el('g', { id: 'wingL' });
  wingL.appendChild(part(`${dir}/wingL.png`));
  root.appendChild(wingL);

  const wingR = el('g', { id: 'wingR' });
  wingR.appendChild(part(`${dir}/wingR.png`));
  root.appendChild(wingR);

  renderSweat(root);
  svg.appendChild(root);
}
