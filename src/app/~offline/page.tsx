import styles from './offline.module.scss';

export default function OfflinePage() {
  return (
    <div className={styles.container}>
      <h1>오프라인 상태예요</h1>
      <p>인터넷 연결을 확인한 후 다시 시도해주세요.</p>
    </div>
  );
}
