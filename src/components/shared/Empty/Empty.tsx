import styles from './Empty.module.scss';

type EmptyProps = {
  message: string;
  subMessage?: string;
  fullHeight?: boolean;
};

export default function Empty({
  message,
  subMessage,
  fullHeight = false,
}: EmptyProps) {
  return (
    <div
      className={`${styles.emptyContainer} ${fullHeight ? styles.full : ''}`}
    >
      <p>{message}</p>
      {subMessage && <span>{subMessage}</span>}
    </div>
  );
}
