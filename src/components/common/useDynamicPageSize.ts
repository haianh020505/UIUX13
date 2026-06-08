import { useEffect, useState } from 'react';

const HEADER_HEIGHT = 64;
const FILTER_BAR_HEIGHT = 56;
const TABLE_HEADER_HEIGHT = 44;
const PAGINATION_HEIGHT = 52;
const ROW_HEIGHT = 56;
const PAGE_PADDING = 48;

export default function useDynamicPageSize(minSize = 5) {
  const [pageSize, setPageSize] = useState(minSize);

  useEffect(() => {
    const calculate = () => {
      const available = window.innerHeight - HEADER_HEIGHT - FILTER_BAR_HEIGHT - TABLE_HEADER_HEIGHT - PAGINATION_HEIGHT - PAGE_PADDING;
      setPageSize(Math.max(minSize, Math.floor(available / ROW_HEIGHT)));
    };

    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [minSize]);

  return pageSize;
}
