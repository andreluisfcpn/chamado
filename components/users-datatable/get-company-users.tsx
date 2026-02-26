'use client'
import useSWR from 'swr'
import axios from 'axios'
import { clientAdminColumns } from './client-admin-columns'
import { ClientAdminDataTable } from './client-admin-data-table'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function CompanyUsersList() {
  const { data, isLoading } = useSWR('/api/users/company', fetcher)

  return (
    <ClientAdminDataTable
      columns={clientAdminColumns}
      data={data?.users || []}
      isLoading={isLoading}
    />
  )
}
