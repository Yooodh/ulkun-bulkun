/**
 * 한국 시간 기준 YY. MM. DD 형식 포맷팅 함수
 */

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-';

  const d = new Date(dateString);

  return new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  })
    .format(d)
    .replace(/\. /g, '. ')
    .replace('.', '');
};

export const toInputDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
