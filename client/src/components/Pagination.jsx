import { useMemo } from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsRange, totalItems }) => {
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
      {itemsRange && totalItems !== undefined ? (
        <p className="text-sm text-slate-400 font-semibold">
          Showing <span className="text-slate-700 font-bold">{itemsRange.start}</span> to{' '}
          <span className="text-slate-700 font-bold">{itemsRange.end}</span> of{' '}
          <span className="text-slate-700 font-bold">{totalItems}</span> products
        </p>
      ) : (
        <p className="text-sm text-slate-400 font-semibold">
          Page <span className="text-slate-700 font-bold">{currentPage}</span> of{' '}
          <span className="text-slate-700 font-bold">{totalPages}</span>
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50 border-slate-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-sky-500 bg-white border-slate-200'
          }`}
        >
          Previous
        </button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-100'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-sky-500 bg-white'
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed bg-slate-50/50 border-slate-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-sky-500 bg-white border-slate-200'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
