'use client';

import React, { useState } from 'react';
import { TopProduct } from '@/types/dashboard';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import { SkeletonTable } from '@/components/ui/skeleton';

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading?: boolean;
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  isLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedProducts = products.slice(startIdx, endIdx);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Top Products" description="By revenue" />
        <CardBody>
          <SkeletonTable rows={5} />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Top Products" description="By revenue" />
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Product
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Orders
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, index) => (
                <tr
                  key={product.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === displayedProducts.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{product.image || '📦'}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                    ${product.revenue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {product.orders}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : product.stock > 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
