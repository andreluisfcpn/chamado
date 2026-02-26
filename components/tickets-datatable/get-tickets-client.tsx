'use client'
import useSWR from 'swr'
import { useState } from 'react'
import axios from 'axios'
import { DataTable } from './data-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SelectForm } from '../select-form'
import { clientColumns } from './client-columns'
import Link from 'next/link'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function ClientTicketsList() {
  const [page, setPage] = useState(1)
  const limit = 10

  const [codeInput, setCodeInput] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [priorityInput, setPriorityInput] = useState('')

  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  // Monta a query string dos filtros
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (code) params.append('code', code)
  if (status && status !== '') params.append('status', status)
  if (priority && priority !== '') params.append('priority', priority)

  const { data, isLoading } = useSWR(
    `/api/tickets/client?${params.toString()}`,
    fetcher,
  )

  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Mapas para os valores dos filtros
  const statusOptions = [
    { value: 'OPEN', label: 'Em Aberto' },
    { value: 'IN_PROGRESS', label: 'Aguardando Responsável' },
    { value: 'PENDING_CLIENT', label: 'Aguardando Cliente' },
    { value: 'CLOSED', label: 'Resolvidos' },
    { value: 'CANCELED', label: 'Cancelados' },
  ]
  const priorityOptions = [
    { value: 'LOW', label: 'Baixa' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ]

  // Handler para aplicar todos os filtros
  function handleFilter() {
    setCode(codeInput)
    setStatus(statusInput)
    setPriority(priorityInput)
    setPage(1)
  }

  function handleClearFilters() {
    setCodeInput('')
    setStatusInput('')
    setPriorityInput('')
    setCode('')
    setStatus('')
    setPriority('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="w-full flex md:hidden items-center justify-end">
        <Button className="inline-flex h-12" asChild>
          <Link href="/dashboard/cliente/chamados/cadastro">Novo Chamado</Link>
        </Button>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-2">
        <div className="w-full flex flex-col md:flex-row items-center gap-2">
          <Input
            placeholder="Filtrar por código (ex: CH-123456)"
            className="w-full md:w-[350px] h-12 placeholder:text-sm placeholder:font-medium"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFilter()
            }}
          />

          <div className="w-full md:w-[250px]">
            <SelectForm
              items={statusOptions}
              label="um Status"
              itemSelected={setStatusInput}
              value={statusInput}
            />
          </div>

          <div className="w-full md:w-[250px]">
            <SelectForm
              items={priorityOptions}
              label="uma Prioridade"
              itemSelected={setPriorityInput}
              value={priorityInput}
            />
          </div>

          <Button className="w-full md:w-32 h-12" onClick={handleFilter}>
            Aplicar Filtros
          </Button>

          {(code || status !== '' || priority !== '') && (
            <Button
              variant="outline"
              className="w-full md:w-32 h-12"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        <Button className="hidden md:inline-flex h-12" asChild>
          <Link href="/dashboard/cliente/chamados/cadastro">Novo Chamado</Link>
        </Button>
      </div>

      <DataTable
        columns={clientColumns}
        data={data?.tickets || []}
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => setPage(idx + 1)}
        isLoading={isLoading}
      />
    </div>
  )
}
