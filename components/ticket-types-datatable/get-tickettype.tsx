'use client'
import useSWR from 'swr'
import axios from 'axios'
import { DataTable } from './data-table'
import { columns } from './columns'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function TicketTypesList() {
  const { data, isLoading } = useSWR('/api/ticket-types', fetcher)

  return (
    <DataTable
      columns={columns}
      data={data?.ticketTypes || []}
      isLoading={isLoading}
    />
  )
}
