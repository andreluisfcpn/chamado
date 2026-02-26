import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '../ui/button'
import { EllipsisVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { DataTableColumnHeader } from './data-table-column-header'

export type Ticket = {
  id: string
  title: string
  code: string
  status: string
  priority: string
  assignee?: { name: string } | null
  author: { name: string }
  ticketType: { name: string }
  company: { name: string }
  updates: { createdAt: string }[]
}

type MapsType = { label: string; circleClass: string; textClass: string }

const statusMap: Record<string, MapsType> = {
  OPEN: {
    label: 'Em Aberto',
    circleClass: 'bg-zinc-400 hover:bg-zinc-400',
    textClass: 'text-zinc-400 hover:text-zinc-400',
  },
  IN_PROGRESS: {
    label: 'Aguardando Responsável',
    circleClass: 'bg-yellow-400 hover:bg-yellow-400',
    textClass: 'text-yellow-400 hover:text-yellow-400 font-bold',
  },
  PENDING_CLIENT: {
    label: 'Aguardando Cliente',
    circleClass: 'bg-yellow-400 hover:bg-yellow-400',
    textClass: 'text-yellow-400 hover:text-yellow-400',
  },
  CLOSED: {
    label: 'Resolvido',
    circleClass: 'bg-emerald-400 hover:bg-emerald-400',
    textClass: 'text-emerald-400 hover:text-emerald-400',
  },
  CANCELED: {
    label: 'Cancelado',
    circleClass: 'bg-red-400 hover:bg-red-400',
    textClass: 'text-red-400 hover:text-red-400',
  },
}
const priorityMap: Record<string, MapsType> = {
  LOW: {
    label: 'Baixa',
    circleClass: 'bg-zinc-400 hover:bg-zinc-400',
    textClass: 'text-zinc-400 hover:text-zinc-400',
  },
  MEDIUM: {
    label: 'Média',
    circleClass: 'bg-yellow-400 hover:bg-yellow-400',
    textClass: 'text-yellow-400 hover:text-yellow-400',
  },
  HIGH: {
    label: 'Alta',
    circleClass: 'bg-orange-400 hover:bg-orange-400',
    textClass: 'text-orange-400 hover:text-orange-400',
  },
  URGENT: {
    label: 'Urgente',
    circleClass: 'bg-red-400 hover:bg-red-400',
    textClass: 'text-red-400 hover:text-red-400',
  },
}

export const clientColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'title',
    header: 'Chamado',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.title}</div>
        <div className="text-sm text-zinc-400">#{row.original.code}</div>
      </div>
    ),
  },
  {
    accessorKey: 'ticketType.name',
    header: 'Tipo',
    cell: ({ row }) => row.original.ticketType.name,
  },
  {
    accessorKey: 'priority',
    header: 'Prioridade',
    cell: ({ row }) => (
      <div className="w-full flex gap-2 items-center">
        <div
          className={`h-2 w-2 rounded-full ${priorityMap[row.original.priority]?.circleClass || ''}`}
        />
        <p className={`${priorityMap[row.original.priority]?.textClass || ''}`}>
          {priorityMap[row.original.priority]?.label || row.original.priority}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'author.name',
    header: 'Autor',
    cell: ({ row }) => row.original.author.name,
  },
  {
    id: 'assignee',
    accessorFn: (row) => row.assignee?.name || '',
    header: 'Responsável',
    cell: ({ row }) => row.original.assignee?.name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <div className="w-full flex gap-2 items-center">
        <div
          className={`h-2 w-2 rounded-full ${statusMap[row.original.status]?.circleClass || ''}`}
        />
        <p className={`${statusMap[row.original.status]?.textClass || ''}`}>
          {statusMap[row.original.status]?.label || row.original.status}
        </p>
      </div>
    ),
  },
  {
    id: 'lastUpdate',
    accessorFn: (row) => row.updates[0]?.createdAt || '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Última Atualização" />
    ),
    cell: ({ getValue }) =>
      getValue()
        ? formatDistanceToNow(new Date(getValue() as string), {
            locale: ptBR,
            addSuffix: true,
          })
        : '-',
    enableSorting: true,
    sortingFn: 'datetime',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <EllipsisVertical className="h-4 w-4 text-zinc-400" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuItem>
            <Link href={`/dashboard/cliente/chamado/${row.original.code}`}>
              Detalhes do Chamado
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
