import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationSection = ({ currentPage, totalPages, setCurrentPage }) => {
  return (
    <div className="flex justify-center items-center mt-6 space-x-4">
      <button
        className="bg-white border border-gray-300 rounded-l-md px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-gray-700">
        Page {currentPage} of {totalPages || 1}
      </span>
      <button
        className="bg-white border border-gray-300 rounded-r-md px-4 py-2 flex items-center text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default PaginationSection;