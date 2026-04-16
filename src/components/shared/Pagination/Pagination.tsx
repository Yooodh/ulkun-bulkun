'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { usePagination, DOTS } from '@/hooks/usePagination';

import styles from './Pagination.module.scss';

type PaginationProps = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

export default function Pagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const { pages, totalPageCount } = usePagination({
    totalCount,
    pageSize,
    currentPage,
    siblingCount,
  });

  if (totalPageCount <= 1) return null;

  return (
    <nav aria-label='페이지 탐색' className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.arrow}
        aria-label='이전 페이지'
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((page, idx) =>
        page === DOTS ? (
          <span key={`dots-${idx}`} className={styles.dots}>
            ···
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${styles.page} ${page === currentPage ? styles.active : ''}`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPageCount}
        className={styles.arrow}
        aria-label='다음 페이지'
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
