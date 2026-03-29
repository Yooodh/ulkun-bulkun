/**
 * 한국 시간 기준 YY. MM. DD 형식 포맷팅 함수
 */

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-';

  const d = new Date(dateString);

  const formatted = new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(d);

  return formatted.replace(/\.$/, '');
};

/**
 * 날짜 객체나 문자열을 HTML input 태그에 적합한 'YYYY-MM-DD' 형식으로 변환 함수
 */

export const toInputDate = (dateString: string | Date) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
