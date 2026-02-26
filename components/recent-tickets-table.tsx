'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { TailSpin } from 'react-loader-spinner'

interface RecentTicket {
  id: string
  code: string
  status: string
  title: string
  ticketType: {
    name: string
  }
  company: {
    name: string
  }
  author: {
    name: string
  }
  assignee: {
    name: string
  } | null
  updatedAt: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  slaStatus?: 'WITHIN_SLA' | 'AT_RISK' | 'BREACHED'
  slaDeadline?: string
  timeRemaining?: number
}

interface RecentTicketsTableProps {
  tickets: RecentTicket[]
  isLoading?: boolean
}

const priorityMap = {
  LOW: {
    label: 'Baixa',
    classCircle: 'bg-zinc-400',
    classText: 'text-zinc-400',
  },
  MEDIUM: {
    label: 'Média',
    classCircle: 'bg-yellow-400',
    classText: 'text-yellow-400',
  },
  HIGH: {
    label: 'Alta',
    classCircle: 'bg-orange-400',
    classText: 'text-orange-400',
  },
  URGENT: {
    label: 'Urgente',
    classCircle: 'bg-red-400',
    classText: 'text-red-400',
  },
}

const statusMap = {
  OPEN: {
    label: 'Em Aberto',
    classCircle: 'bg-zinc-400',
    classText: 'text-zinc-400',
  },
  IN_PROGRESS: {
    label: 'Aguardando Responsável',
    classCircle: 'bg-yellow-400',
    classText: 'text-yellow-400',
  },
  PENDING_CLIENT: {
    label: 'Aguardando Cliente',
    classCircle: 'bg-yellow-400',
    classText: 'text-yellow-400',
  },
  CLOSED: {
    label: 'Resolvido',
    classCircle: 'bg-emerald-400',
    classText: 'text-emerald-400',
  },
  CANCELED: {
    label: 'Cancelado',
    classCircle: 'bg-red-400',
    classText: 'text-red-400',
  },
}

export function RecentTicketsTable({
  tickets,
  isLoading,
}: RecentTicketsTableProps) {
  const router = useRouter()
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chamado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Última Atualização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
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
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                onClick={() =>
                  router.push(`/dashboard/administrador/chamado/${ticket.code}`)
                }
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-zinc-400">#{ticket.code}</div>
                  </div>
                </TableCell>
                <TableCell>{ticket.ticketType.name}</TableCell>
                <TableCell>{ticket.company.name}</TableCell>
                <TableCell>
                  <div>
                    <span
                      className={`inline-block h-2 w-2 rounded-full mr-2 ${priorityMap[ticket.priority].classCircle}`}
                    ></span>
                    <span
                      className={`text-sm ${priorityMap[ticket.priority].classText}`}
                    >
                      {priorityMap[ticket.priority].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{ticket.author.name}</TableCell>
                <TableCell>
                  {ticket.assignee ? ticket.assignee.name : 'Não atribuído'}
                </TableCell>
                <TableCell>
                  <div>
                    <span
                      className={`inline-block h-2 w-2 rounded-full mr-2 ${statusMap[ticket.status as keyof typeof statusMap].classCircle}`}
                    ></span>
                    <span
                      className={`text-sm ${statusMap[ticket.status as keyof typeof statusMap].classText}`}
                    >
                      {statusMap[ticket.status as keyof typeof statusMap].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {ticket.slaStatus === 'WITHIN_SLA' && (
                      <div className="flex items-center text-emerald-400 text-sm">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
                        Em dia
                      </div>
                    )}
                    {ticket.slaStatus === 'AT_RISK' && (
                      <div className="flex items-center text-yellow-600 text-sm">
                        <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                        Atenção
                      </div>
                    )}
                    {ticket.slaStatus === 'BREACHED' && (
                      <div className="flex items-center text-red-600 text-sm">
                        <span className="inline-block h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                        Vencido
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(ticket.updatedAt), "dd/MM/y 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Nenhum chamado recente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* {tickets.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Nenhum chamado recente encontrado.
        </div>
      )} */}
    </div>
  )
}
