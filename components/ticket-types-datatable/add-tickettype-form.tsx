'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

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

export type AddTicketTypeFormValues = z.infer<typeof schema>

export function AddTicketTypeForm() {
  const router = useRouter()
  const { mutate } = useSWR('/api/ticket-types', fetcher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTicketTypeFormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: AddTicketTypeFormValues) => {
    await axios
      .post('/api/ticket-types', data)
      .then((response) => {
        reset()
        mutate('/api/ticket-types')
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
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
      <div>
        <InputText
          id="description"
          label="Descrição"
          placeholder="Digite uma curta descrição do tipo de chamado"
          error={errors.description?.message}
          {...register('description')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <InputText
            id="slaResponseTime"
            label="SLA Tempo de Resposta (horas)"
            type="number"
            placeholder="Ex: 2"
            error={errors.slaResponseTime?.message}
            {...register('slaResponseTime')}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
          <p className="text-sm text-gray-500 mt-1">
            Tempo máximo para primeira resposta
          </p>
        </div>

        <div>
          <InputText
            id="slaSolutionTime"
            label="SLA Tempo de Solução (horas)"
            type="number"
            placeholder="Ex: 24"
            error={errors.slaSolutionTime?.message}
            {...register('slaSolutionTime')}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
          <p className="text-sm text-gray-500 mt-1">
            Tempo máximo para resolução completa
          </p>
        </div>
      </div>
      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <LoaderCircle size={24} className="animate-spin" />
            <p>Aguarde um momento</p>
          </div>
        ) : (
          'Cadastrar Tipo de Chamado'
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
