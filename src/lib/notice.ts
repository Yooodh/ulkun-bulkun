export type NoticeItem = {
  title: string;
  description?: string;
};

export type Notice = {
  version: string;
  date: string;
  title: string;
  content: NoticeItem[];
  highlight?: string | null;
  link_url?: string | null;
};

export const NOTICE_STORAGE_KEY = 'notice-dismissed';

export async function fetchNotice(): Promise<Notice | null> {
  try {
    const res = await fetch('/api/notice');
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.content)) return null;
    return data as Notice;
  } catch {
    return null;
  }
}
