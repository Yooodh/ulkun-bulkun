/**
 * 숫자 입력창(type="number")에서 e, E, +, - 입력을 방지하는 함수
 */

export const blockInvalidNumberChars = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};
