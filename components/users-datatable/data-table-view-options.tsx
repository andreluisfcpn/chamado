'use client'

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Eye } from 'lucide-react'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-11 lg:flex text-zinc-400 hover:text-zinc-400"
        >
          <Eye className="mr-1 h-4 w-4" />
          Visualizar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Alternar Colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="text-muted-foreground! hover:bg-primary! hover:text-accent-foreground! data-[state=checked]:hover:bg-primary data-[state=checked]:hover:text-accent-foreground cursor-pointer"
                checked={column.getIsVisible()}
                onCheckedChange={(value: any) =>
                  column.toggleVisibility(!!value)
                }
              >
                {column.id === 'name' && 'Nome'}
                {column.id === 'assignedTickets' && 'Chamados Atribuídos'}
                {column.id === 'createdTickets' && 'Chamados Criados'}
                {column.id === 'email' && 'E-mail'}
                {column.id === 'role' && 'Função'}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
