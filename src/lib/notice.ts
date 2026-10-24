export type Notice = {
  version: string;
  date: string;
  title: string;
  content: string[];
  highlight?: string;
};

export const NOTICE: Notice | null = {
  version: 'v2.0.0',
  date: '2026.10.20',
  title: 'title',
  content: ['content1', 'content2'],
  highlight: 'highlight',
};

export const NOTICE_STORAGE_KEY = 'notice-dismissed';
