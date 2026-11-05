const NICKNAME_PATTERN = /^[a-z0-9가-힣]{2,10}$/;

export function normalizeNickname(nickname: string): string {
  return nickname.trim().toLowerCase();
}

export function isValidNickname(nickname: string): boolean {
  return NICKNAME_PATTERN.test(nickname);
}

export function resolveResetNickname(
  metadataNickname: string | null | undefined,
  currentNickname: string,
): string {
  const normalizedMetadataNickname = normalizeNickname(metadataNickname ?? '');

  return isValidNickname(normalizedMetadataNickname)
    ? normalizedMetadataNickname
    : currentNickname;
}
