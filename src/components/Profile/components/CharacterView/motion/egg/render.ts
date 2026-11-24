const NS = 'http://www.w3.org/2000/svg';

function el(tag: string, attrs: Record<string, string | number> = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) =>
    node.setAttribute(key, String(value)),
  );
  return node;
}

export function renderEgg(svg: SVGSVGElement) {
  svg.setAttribute('viewBox', '-120 -260 1264 1384');

  const root = el('g', { id: 'root' });
  root.appendChild(el('g', { id: 'barbellBack', opacity: 0 }));

  const body = el('image', {
    href: '/chars/egg/body.png',
    x: 0,
    y: 0,
    width: 1024,
    height: 1024,
  });
  root.appendChild(body);
  root.appendChild(el('g', { id: 'barbellFront', opacity: 0 }));
  svg.appendChild(root);
}
