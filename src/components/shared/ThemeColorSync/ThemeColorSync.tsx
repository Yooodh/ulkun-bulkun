'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const COLORS = { light: '#f0f7ff', dark: '#222f37' };

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === 'dark' ? COLORS.dark : COLORS.light;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.removeAttribute('media');
    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
