import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationProps = {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  unit: string;
  onChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, totalPages, total, unit, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = buildPaginationItems(page, totalPages);

  return (
    <div className="pagination">
      <span className="pagination__info">
        Hiển thị {start}-{end} trên tổng số {total} {unit}
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft size={14} />
        </button>
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="pagination__ellipsis">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination__btn ${page === item ? 'pagination__btn--active' : ''}`}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="pagination__btn"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function buildPaginationItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}
