type UsePaginationProps = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  siblingCount?: number;
};

export const DOTS = '...' as const;

export function usePagination({
  totalCount,
  pageSize,
  currentPage,
  siblingCount = 1,
}: UsePaginationProps) {
  const totalPageCount = Math.ceil(totalCount / pageSize);

  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPageCount) {
    return { pages: range(1, totalPageCount), totalPageCount };
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount,
  );

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPageCount - 1;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return {
      pages: [...range(1, leftItemCount), DOTS, totalPageCount],
      totalPageCount,
    };
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return {
      pages: [
        1,
        DOTS,
        ...range(totalPageCount - rightItemCount + 1, totalPageCount),
      ],
      totalPageCount,
    };
  }

  return {
    pages: [
      1,
      DOTS,
      ...range(leftSiblingIndex, rightSiblingIndex),
      DOTS,
      totalPageCount,
    ],
    totalPageCount,
  };
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
