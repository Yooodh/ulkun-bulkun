import styles from './Button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'gray' | 'red' | 'ligray' | 'blue' | 'white' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'round';
  active?: boolean;
};

export default function Button({
  children,
  variant = 'gray',
  size = 'md',
  shape = 'square',
  active,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${styles[shape]} ${active ? styles.active : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
