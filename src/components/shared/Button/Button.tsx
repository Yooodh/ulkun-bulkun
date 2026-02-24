import styles from './Button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'gray' | 'red' | 'ligray' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'round';
};

export default function Button({
  children,
  variant = 'gray',
  size = 'md',
  shape = 'square',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${styles[shape]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
