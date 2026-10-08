'use client';

import Link from 'next/link';

import { usePressNavigate } from '@/hooks/usePressNavigate';

import styles from './NavBar.module.scss';

type NavBarProps = {
  href: string;
  label: string;
};

export default function NavBar({ href, label }: NavBarProps) {
  const { isPressed, handlers } = usePressNavigate(href);

  return (
    <div className={styles.navBarContainer}>
      <Link
        href={href}
        prefetch
        className={`${styles.navBarLink} ${isPressed ? styles.pressed : ''}`}
        {...handlers}
      >
        {label}
      </Link>
    </div>
  );
}
