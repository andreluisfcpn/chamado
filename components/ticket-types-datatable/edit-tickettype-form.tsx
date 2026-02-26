'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import { useEffect } from 'react'
import { TicketType } from '@prisma/client'
import Link from 'next/link'

const fetcher = async ([url, id]: any) =>
  await axios.get(url, { params: { id } }).then((res) => res.data)

const schema = z
  .object({
    name: z.string().nonempty('O nome é obrigatório.'),
    description: z.string().optional().nullable(),
    slaResponseTime: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().min(1, 'Tempo mínimo: 1 hora').optional(),
    ),
    slaSolutionTime: z.preprocess(
      (val) => (val === '' ? undefined : Number(val)),
      z.number().min(1, 'Tempo mínimo: 1 hora').optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.slaResponseTime && data.slaSolutionTime) {
        return data.slaSolutionTime > data.slaResponseTime
      }
      return true
    },
    {
      message: 'SLA de solução deve ser maior que SLA de resposta',
      path: ['slaSolutionTime'],
    },
  )

export type EditTicketTypeFormValues = z.infer<typeof schema>

export function EditTicketTypeForm() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const { data: typeData, isLoading: isLoadingType } = useSWR(
    ['/api/ticket-types/type', params.id],
    fetcher,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTicketTypeFormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const typeDataInfo = typeData?.ticketType as TicketType

    if (typeDataInfo) {
      reset({
        name: typeData.ticketType.name,
        description: typeData.ticketType.description,
        slaResponseTime: typeData.ticketType.slaResponseTime,
        slaSolutionTime: typeData.ticketType.slaSolutionTime,
      })
    }
  }, [typeData, reset])

  const onSubmit = async (data: EditTicketTypeFormValues) => {
    await axios
      .patch('/api/ticket-types', { id: typeData?.ticketType.id, ...data })
      .then((response) => {
        reset()
        toast.success(response.data.message)
        router.push('/dashboard/administrador/chamados/tipos')
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            'Erro ao adicionar o tipo de chamado',
        )
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <InputText
          id="name"
          label="Tipo de Chamado"
          isRequired
          placeholder="Digite o tipo de chamado"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting || isLoadingType}
          loading={isSubmitting || isLoadingType}
        />
      </div>
      <div>
        <InputText
          id="description"
          label="Descrição"
          placeholder="Digite uma curta descrição do tipo de chamado"
          error={errors.description?.message}
          {...register('description')}
          disabled={isSubmitting || isLoadingType}
          loading={isSubmitting || isLoadingType}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputText
            id="slaResponseTime"
            label="Tempo de Resposta (horas)"
            type="number"
            placeholder="Ex: 1 = 1 hora"
            error={errors.slaResponseTime?.message}
            {...register('slaResponseTime')}
            disabled={isSubmitting || isLoadingType}
            loading={isSubmitting || isLoadingType}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Tempo máximo da primeira resposta
          </p>
        </div>

        <div>
          <InputText
            id="slaSolutionTime"
            label="Tempo de Solução (horas)"
            type="number"
            placeholder="Ex: 48 = 48 horas (2 dias)"
            error={errors.slaSolutionTime?.message}
            {...register('slaSolutionTime')}
            disabled={isSubmitting || isLoadingType}
            loading={isSubmitting || isLoadingType}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Tempo máximo da resolução
          </p>
        </div>
      </div>
      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting || isLoadingType}
      >
        {isSubmitting || isLoadingType ? (
          <div className="flex items-center gap-2">
            <LoaderCircle size={24} className="animate-spin" />
            <p>Aguarde um momento</p>
          </div>
        ) : (
          'Salvar Alterações'
        )}
      </Button>

      <Button
        variant="outline"
        className="flex w-full h-12 justify-center mt-2 md:hidden"
        asChild
      >
        <Link href="/dashboard/administrador/chamados/tipos">Cancelar</Link>
      </Button>
    </form>
  )
}
