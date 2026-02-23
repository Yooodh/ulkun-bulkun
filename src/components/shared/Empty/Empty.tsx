import styles from './Empty.module.scss';

type EmptyProps = {
  message: string;
  subMessage?: string;
};

export default function Empty({ message, subMessage }: EmptyProps) {
  return (
    <div className={styles.emptyContainer}>
      <p>{message}</p>
      {subMessage && <span>{subMessage}</span>}
    </div>
  );
}
