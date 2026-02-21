import styles from './Loading.module.scss';

type LoadingProps = {
  message?: string;
  fullHeight?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export default function Loading({
  message = '불러오는 중...',
  fullHeight = false,
  size = 'md',
}: LoadingProps) {
  return (
    <div
      className={`${styles.loadingContainer} ${fullHeight ? styles.full : ''} ${styles[size]}`}
    >
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
}
