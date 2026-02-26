/* eslint-disable no-unused-vars */
'use client'

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  VisibilityState,
  ColumnFiltersState,
  SortingState,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { TailSpin } from 'react-loader-spinner'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  pageIndex?: number
  onPageChange?: (page: number) => void
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageIndex,
  onPageChange,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [internalSorting, setInternalSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    manualPagination: !!pageCount,
    pageCount,
    state: {
      sorting: internalSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex: pageIndex || 0, pageSize: data.length },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setInternalSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater({
          pageIndex: pageIndex || 0,
          pageSize: data.length,
        })
        onPageChange?.(next.pageIndex + 1)
      } else if (
        typeof updater === 'object' &&
        updater.pageIndex !== undefined
      ) {
        onPageChange?.(updater.pageIndex + 1)
      }
    },
  })

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <TailSpin
                    visible={true}
                    height="50"
                    width="50"
                    color="#ff6900"
                    ariaLabel="tail-spin-loading"
                    radius="2"
                    wrapperStyle={{}}
                    wrapperClass="justify-start md:justify-center"
                  />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Nenhum chamado encontrado no sistema.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPageChange && pageIndex && onPageChange(pageIndex - 1)
            }
            disabled={pageIndex === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onPageChange && pageIndex && onPageChange(pageIndex + 1)
            }
            disabled={pageIndex === pageCount}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
