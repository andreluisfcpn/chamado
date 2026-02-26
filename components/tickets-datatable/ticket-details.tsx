'use client'

import axios from 'axios'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { TicketMessages } from './ticket-messages'
import { HeaderTicketDetail } from './header-ticket-detail'
import { AddTicketMessageForm } from './add-ticket-message'
import { Separator } from '../ui/separator'
import { useSession } from 'next-auth/react'

const fetcherTicket = async ([url, code]: any) =>
  await axios.get(url, { params: { code } }).then((res) => res.data)

export function DirectTicketDetails() {
  const { data, status } = useSession()

  const params = useParams<{ code: string }>()

  const { data: ticketData, isLoading: isLoadingTicket } = useSWR(
    ['/api/tickets/details', params.code],
    fetcherTicket,
  )

  if (isLoadingTicket || status === 'loading' || !ticketData?.ticket) {
    return (
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <HeaderTicketDetail
            isLoading={true}
            code=""
            title=""
            ticketType={{ name: '' }}
            author={{ id: '', name: '', image: '' }}
            assignee={{ name: '', image: '' }}
            status=""
            priority=""
            createdAt=""
          />
          <Separator />
          <TicketMessages
            isLoading={true}
            messages={[]}
            userId=""
            ticketStatus=""
          />
        </div>
        <div>
          <AddTicketMessageForm
            isLoading={true}
            ticketId=""
            ticketStatus=""
            isAssignee={false}
            loggedUserRole=""
            authorId=""
            rating={null}
          />
        </div>
      </div>
    )
  }

  const ticket = ticketData.ticket

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <div className="space-y-4">
        <HeaderTicketDetail
          code={ticket.code}
          title={ticket.title}
          ticketType={ticket.ticketType}
          author={ticket.author}
          assignee={ticket.assignee}
          status={ticket.status}
          priority={ticket.priority}
          createdAt={ticket.createdAt}
          slaStatus={ticket.slaStatus}
          slaResponseDeadline={ticket.slaResponseDeadline}
          slaSolutionDeadline={ticket.slaSolutionDeadline}
          firstResponseAt={ticket.firstResponseAt}
          isLoading={false}
        />
        <Separator />
        <TicketMessages
          messages={ticket.updates}
          isLoading={false}
          userId={data?.user.id}
          ticketStatus={ticket.status}
        />
      </div>
      <div>
        <AddTicketMessageForm
          isLoading={false}
          ticketId={ticket.id}
          ticketStatus={ticket.status}
          isAssignee={!!ticket.assignee}
          loggedUserRole={data?.user.role as string}
          authorId={ticket.author.id}
          rating={ticket.ticketRatings[0] || null}
        />
      </div>
    </div>
  )
}
