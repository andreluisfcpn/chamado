'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import { User } from '@prisma/client'
import { SelectForm } from '../select-form'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)
const fetcherTicket = async ([url, code]: any) =>
  await axios.get(url, { params: { code } }).then((res) => res.data)

const schema = z.object({
  atendente: z.string().nonempty('O atendente é obrigatório'),
})

export type DirectTicketFormValues = z.infer<typeof schema>

export function DirectTicketForm() {
  const { data, isLoading } = useSWR('/api/users/atendentes', fetcher)
  const { mutate } = useSWR('/api/tickets', fetcher)

  const router = useRouter()
  const params = useParams<{ code: string }>()

  const { data: ticketData, isLoading: isLoadingTicket } = useSWR(
    ['/api/tickets/ticket', params.code],
    fetcherTicket,
  )

  const {
    watch,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DirectTicketFormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: DirectTicketFormValues) => {
    await axios
      .patch('/api/tickets', { id: ticketData?.ticket.id, ...data })
      .then((response) => {
        reset()
        mutate('/api/tickets')
        toast.success(response.data.message)
        router.push('/dashboard/administrador/chamados')
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar o chamado',
        )
      })
  }

  const nomeAtendente = data?.atendentes.find((atendente: User) => {
    return atendente.id === watch('atendente')
  })?.name

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <Controller
          name="atendente"
          control={control}
          render={({ field: { onChange, value } }) => (
            <SelectForm
              items={
                data?.atendentes.map((atendente: User) => ({
                  label: atendente.name,
                  value: atendente.id,
                })) || []
              }
              label="uma opção"
              fieldName="Atendente:"
              error={errors.atendente?.message}
              isRequired
              itemSelected={onChange}
              value={value}
              isLoading={isSubmitting || isLoading || isLoadingTicket}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting || isLoading || isLoadingTicket}
      >
        {isSubmitting || isLoading || isLoadingTicket ? (
          <div className="flex items-center gap-2">
            <LoaderCircle size={24} className="animate-spin" />
            <p>Aguarde um momento</p>
          </div>
        ) : (
          `Direcionar Chamado ${nomeAtendente ? ` para ${nomeAtendente}` : ''}`
        )}
      </Button>
    </form>
  )
}
