'use client'
import useSWR from 'swr'
import axios from 'axios'
import { DataTable } from './data-table'
import { columns } from './columns'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function CompaniesList() {
  const { data, isLoading } = useSWR('/api/companies', fetcher)

  return (
    <DataTable
      columns={columns}
      data={data?.companies || []}
      isLoading={isLoading}
    />
  )
}
