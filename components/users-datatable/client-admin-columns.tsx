import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '../ui/badge'
import { clientAdminRoles, statuses } from '@/lib/data'
import { ClientAdminDataTableRowActions } from './client-admin-data-table-row-actions'

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: 'ACTIVE' | 'INACTIVE'
  company: { name: string }
  createdTickets: { title: string }[]
  assignedTickets: { title: string }[]
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

export const clientAdminColumns: ColumnDef<User>[] = [
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
    accessorKey: 'createdTickets',
    header: 'Chamados Criados',
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-sm font-medium">
        {row.original.createdTickets.length}
      </Badge>
    ),
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Função" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="text-sm text-zinc-500">
          {
            clientAdminRoles.find((role) => role.value === row.original.role)
              ?.label
          }
        </div>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = statuses.find(
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
    id: 'actions',
    header: '',
    cell: ({ row }) => <ClientAdminDataTableRowActions row={row} />,
  },
]
