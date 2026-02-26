import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '../ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import { companyStatuses } from '@/lib/data'

export type Companies = {
  id: string
  name: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  tickets: { title: string }[]
  users: { name: string }[]
}

type MapsType = { circleClass: string; textClass: string }

const statusMap: Record<string, MapsType> = {
  ACTIVE: {
    circleClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
  },
  INACTIVE: {
    circleClass: 'bg-red-400',
    textClass: 'text-red-400',
  },
}

export const columns: ColumnDef<Companies>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'tickets',
    header: 'Chamados',
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-sm font-medium">
        {row.original.tickets.length}
      </Badge>
    ),
  },
  {
    accessorKey: 'users',
    header: 'Usuários',
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-sm font-medium">
        {row.original.users.length}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = companyStatuses.find(
        (status) => status.value === row.getValue('status'),
      )

      if (!status) {
        return null
      }

      return (
        <div className="w-full flex gap-2 items-center">
          <div
            className={`h-2 w-2 rounded-full ${statusMap[status.value]?.circleClass || ''}`}
          />
          <p className={`${statusMap[status.value]?.textClass || ''}`}>
            {status.label}
          </p>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Criado em" />
    ),
    cell: ({ getValue }) =>
      getValue()
        ? format(new Date(getValue() as string), 'dd/MM/yyyy', {
            locale: ptBR,
          })
        : '-',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
