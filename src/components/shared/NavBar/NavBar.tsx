import Link from 'next/link';

import styles from './NavBar.module.scss';

type NavBarProps = {
  href: string;
  label: string;
};

export default function NavBar({ href, label }: NavBarProps) {
  return (
    <div className={styles.navBarContainer}>
      <Link href={href} className={styles.navBarLink}>
        {label}
      </Link>
    </div>
  );
}
