'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const COLORS = { light: '#f0f7ff', dark: '#222f37' };

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === 'dark' ? COLORS.dark : COLORS.light;

    const metas = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );

    if (metas.length === 0) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
      return;
    }

    metas.forEach((meta) => {
      meta.removeAttribute('media');
      meta.content = color;
    });
  }, [resolvedTheme]);

  return null;
}
