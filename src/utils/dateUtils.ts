/** 날짜 전용 문자열을 서울 시간대의 자정으로 파싱하는 함수 */
export const parseDateValue = (dateString: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T00:00:00+09:00`);
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateString);
  if (/^\d{4}-\d{2}-\d{2}T/.test(dateString) && !hasTimezone) {
    return new Date(`${dateString}+09:00`);
  }

  return new Date(dateString);
};

const toValidDate = (dateString: string | Date) => {
  if (!dateString) return null;

  const date =
    dateString instanceof Date
      ? dateString
      : parseDateValue(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** 한국 시간 기준 YY. MM. DD 형식 포맷팅 함수 */
export const formatDate = (dateString: string | Date) => {
  const date = toValidDate(dateString);
  if (!date) return '-';

  const formatted = new Intl.DateTimeFormat('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);

  return formatted.replace(/\.$/, '');
};

/** 서울 시간대 기준 'YYYY년 M월 D일' 형식으로 변환하는 함수 */
export const formatLongDate = (dateString: string | Date) => {
  const date = toValidDate(dateString);
  if (!date) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(date);
};

/** 서울 시간대 기준 하루의 마지막 시각을 반환하는 함수 */
export const getSeoulDayEnd = (dateString: string) => {
  return new Date(
    parseDateValue(dateString).getTime() + 24 * 60 * 60 * 1000 - 1,
  );
};

/** Date 객체를 서울 시간대의 'YYYY-MM-DD' 형식으로 변환하는 함수 */
export const toSeoulInputDate = (date: Date = new Date()) => {
  if (Number.isNaN(date.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
};

/** 날짜 객체나 문자열을 서울 시간대 기준의 HTML input용 'YYYY-MM-DD' 형식으로 변환하는 함수 */
export const toInputDate = (dateString: string | Date) => {
  const date = toValidDate(dateString);
  return date ? toSeoulInputDate(date) : '';
};

/** 서울 날짜 기준으로 만 나이를 계산하는 함수 */
export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;

  const [year, month, day] = birthDate.split(/[-/.]/).map(Number);

  if (!year || !month || !day) return 0;

  const [currentYear, currentMonth, currentDay] = toSeoulInputDate()
    .split('-')
    .map(Number);

  let age = currentYear - year;

  const isBeforeBirthday =
    currentMonth < month || (currentMonth === month && currentDay < day);

  if (isBeforeBirthday) {
    age--;
  }

  return Math.max(0, age);
};
