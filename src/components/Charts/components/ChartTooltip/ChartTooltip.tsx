import styles from './ChartTooltip.module.scss';

export type ChartTooltipRow = {
  label: string;
  value: string;
  valueColor?: string;
};

type ChartTooltipProps = {
  title: string;
  rows: ChartTooltipRow[];
};

export default function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{title}</p>
      {rows.map((row) => (
        <p key={row.label} className={styles.tooltipRow}>
          <span>{row.label}</span>
          <strong
            style={row.valueColor ? { color: row.valueColor } : undefined}
          >
            {row.value}
          </strong>
        </p>
      ))}
    </div>
  );
}
