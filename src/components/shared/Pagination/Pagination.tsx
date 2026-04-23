'use client';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

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
      {/* 맨 앞으로 이동 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={styles.arrow}
        aria-label='첫 페이지로 이동'
      >
        <ChevronsLeft size={15} />
      </button>

      {/* 이전 페이지 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.arrow}
        aria-label='이전 페이지'
      >
        <ChevronLeft size={15} />
      </button>

      {/* 페이지 번호 */}
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

      {/* 다음 페이지 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPageCount}
        className={styles.arrow}
        aria-label='다음 페이지'
      >
        <ChevronRight size={15} />
      </button>

      {/* 맨 끝으로 이동 */}
      <button
        onClick={() => onPageChange(totalPageCount)}
        disabled={currentPage === totalPageCount}
        className={styles.arrow}
        aria-label='마지막 페이지로 이동'
      >
        <ChevronsRight size={15} />
      </button>
    </nav>
  );
}
