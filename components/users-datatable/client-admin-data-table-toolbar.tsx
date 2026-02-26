'use client'

import { Table } from '@tanstack/react-table'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { clientAdminRoles, statuses } from '@/lib/data'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function ClientAdminDataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col lg:flex-row flex-1 items-center gap-2">
        <Input
          placeholder="Buscar pelo nome do usuário..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event: any) => {
            table.getColumn('name')?.setFilterValue(event.target.value)
          }}
          className="h-11 w-full lg:w-[250px] border-zinc-200 focus:border-zinc-300"
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title="Função"
            options={clientAdminRoles.map((role) => ({
              value: role.value,
              label: role.label,
            }))}
          />
        )}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses.map((status) => ({
              value: status.value,
              label: status.label,
            }))}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-12 px-2 lg:px-3"
          >
            Limpar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
