import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '../ui/badge'
import { DataTableRowActions } from './data-table-row-actions'

export type TicketTypes = {
  id: string
  name: string
  description: string
  slaResponseTime?: number | null
  slaSolutionTime?: number | null
  createdAt: string
  tickets: { title: string }[]
}

export const columns: ColumnDef<TicketTypes>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.description ?? '-'}
        </div>
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'slaResponseTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tempo para Primeira Resposta"
      />
    ),
    cell: ({ row }) => {
      const slaTime = row.original.slaResponseTime
      return slaTime ? (
        <Badge className="rounded-sm">
          {slaTime} {slaTime === 1 ? 'hora' : 'horas'}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )
    },
  },
  {
    accessorKey: 'slaSolutionTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tempo para Solução" />
    ),
    cell: ({ row }) => {
      const slaTime = row.original.slaSolutionTime
      return slaTime ? (
        <Badge className="rounded-sm">
          {slaTime} {slaTime === 1 ? 'hora' : 'horas'}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      )
    },
  },
  {
    accessorKey: 'tickets',
    header: 'Chamados Vinculados',
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-sm font-medium">
        {row.original.tickets.length}
      </Badge>
    ),
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
