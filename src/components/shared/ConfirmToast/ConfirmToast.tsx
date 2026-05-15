import { toast } from 'sonner';

import styles from './ConfirmToast.module.scss';

import Button from '../Button/Button';

export function ConfirmToast(message: string, onConfirm: () => void) {
  toast.custom(
    (id) => (
      <div className={styles.container}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button
            variant='ligray'
            className={styles.cancel}
            onClick={() => toast.dismiss(id)}
          >
            취소
          </Button>
          <Button
            variant='blue'
            className={styles.confirm}
            onClick={() => {
              toast.dismiss(id);
              onConfirm();
            }}
          >
            확인
          </Button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
}
