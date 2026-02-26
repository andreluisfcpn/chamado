'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Ban, CircleCheck, LoaderCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { TextareaComponent } from '../textarea'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
import { FileUpload } from '../file-upload'
import { transformFileToBase64 } from '@/utils/helpers'
import { useSession } from 'next-auth/react'
import { TicketRating } from '../ticket-rating'
import {
  TicketRating as TicketRatingData,
  User as UserData,
} from '@prisma/client'
import { TicketRatingCard } from '../ticket-rating-card'

const fetcherTicket = async ([url, code]: any) =>
  await axios.get(url, { params: { code } }).then((res) => res.data)

const schema = z.object({
  content: z.string().nonempty('A mensagem é obrigatória.'),
})

export type AddTicketMessageFormValues = z.infer<typeof schema>

interface AddTicketMessageFormProps {
  ticketId?: string
  ticketStatus?: string
  isLoading?: boolean
  isAssignee?: boolean
  loggedUserRole: string
  authorId: string
  rating: (TicketRatingData & { user: UserData }) | null
}

export function AddTicketMessageForm({
  isLoading,
  ticketId,
  ticketStatus,
  isAssignee,
  loggedUserRole,
  authorId,
  rating,
}: AddTicketMessageFormProps) {
  const { data: user } = useSession()

  let backUrl = ''

  switch (user?.user.role) {
    case 'ADMINISTRADOR':
      backUrl = '/dashboard/administrador/chamados'
      break
    case 'ATENDENTE':
      backUrl = '/dashboard/atendente'
      break
    case 'CLIENTE':
      backUrl = '/dashboard/cliente'
      break
    case 'ADMINISTRADOR_EMPRESA':
      backUrl = '/dashboard/empresa/chamados'
      break
    default:
      backUrl = '/dashboard/administrador/chamados'
  }

  const params = useParams<{ code: string }>()
  const [closeLoading, setCloseLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [openLoading, setOpenLoading] = useState(false)
  const [itsMeLoading, setItsMeLoading] = useState(false)

  const { mutate } = useSWR(
    ['/api/tickets/details', params.code],
    fetcherTicket,
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTicketMessageFormValues>({
    resolver: zodResolver(schema),
  })

  const [files, setFiles] = useState<File[]>([])

  const onSubmit = async (data: AddTicketMessageFormValues) => {
    try {
      const filesBase64 = await transformFileToBase64(files)
      await axios
        .post('/api/tickets/details', {
          ...data,
          id: ticketId,
          ticketFiles: filesBase64,
        })
        .then((response) => {
          reset()
          toast.success(response.data.message)
          setFiles([])
          mutate(['/api/tickets/details', params.code])
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message || 'Erro ao adicionar mensagem.',
          )
        })
    } catch (error) {
      toast.error('Erro ao processar os arquivos')
    }
  }

  const changeTicketStatus = async (status: string) => {
    if (status === 'CLOSED') {
      setCloseLoading(true)
    } else if (status === 'CANCELED') {
      setCancelLoading(true)
    } else if (status === 'OPEN') {
      setOpenLoading(true)
    }

    await axios
      .patch('/api/tickets/change-status', { id: ticketId, status })
      .then((response) => {
        toast.success(response.data.message)
        mutate(['/api/tickets/details', params.code])
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar mensagem.',
        )
      })

    if (status === 'CLOSED') {
      setCloseLoading(false)
    } else if (status === 'CANCELED') {
      setCancelLoading(false)
    } else if (status === 'OPEN') {
      setOpenLoading(false)
    }
  }

  const becomeResponsibleSupport = async () => {
    setItsMeLoading(true)

    await axios
      .patch('/api/tickets/change-assignee', {
        id: ticketId,
      })
      .then((response) => {
        toast.success(response.data.message)
        mutate(['/api/tickets/details', params.code])
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar mensagem.',
        )
      })
      .finally(() => setItsMeLoading(false))
  }

  return isLoading ? (
    <div className="animate-pulse">
      <div className="mb-4">
        <div className="w-36 h-6 bg-zinc-100 mb-2 rounded" />
        <div className="flex gap-2">
          <div className="w-44 h-8 bg-zinc-100 mb-2 rounded" />
          <div className="w-44 h-8 bg-zinc-100 mb-2 rounded" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <div className="w-24 h-4 bg-zinc-100 rounded" />
          <div className="w-full h-80 bg-zinc-100 rounded" />
        </div>

        <div className="space-y-1">
          <div className="w-24 h-4 bg-zinc-100 rounded" />
          <div className="w-full h-40 bg-zinc-100 rounded" />
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-0 md:gap-x-4 gap-y-2 md:gap-y-0">
          <div className="w-full h-12 col-span-2 bg-zinc-100 rounded" />
          <div className="w-full h-12 bg-zinc-100 rounded" />
        </div>
      </div>
    </div>
  ) : (
    <>
      {!rating && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-zinc-600 mb-1">
            Ações Rápidas:
          </h2>
          {ticketStatus === 'CLOSED' || ticketStatus === 'CANCELED' ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-500/90 text-white"
                onClick={() => changeTicketStatus('OPEN')}
                disabled={openLoading}
              >
                {openLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle size={24} className="animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  <>
                    <CircleCheck size={16} />
                    Reabrir chamado
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                type="button"
                size="sm"
                disabled={isSubmitting}
                asChild
              >
                <Link href={backUrl}>Voltar</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-600/90 text-white"
                onClick={() => changeTicketStatus('CLOSED')}
                disabled={closeLoading}
              >
                {closeLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle
                      size={24}
                      className="animate-spin text-white"
                    />
                    Carregando...
                  </div>
                ) : (
                  <>
                    <CircleCheck size={16} />
                    Finalizar chamado
                  </>
                )}
              </Button>

              {['ADMINISTRADOR', 'ATENDENTE'].includes(loggedUserRole) &&
                !isAssignee && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => becomeResponsibleSupport()}
                    disabled={itsMeLoading}
                  >
                    {itsMeLoading ? (
                      <div className="flex items-center gap-2">
                        <LoaderCircle size={24} className="animate-spin" />
                        Carregando...
                      </div>
                    ) : (
                      <>
                        <User size={16} />
                        Assumir chamado
                      </>
                    )}
                  </Button>
                )}

              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => changeTicketStatus('CANCELED')}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle size={24} className="animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  <>
                    <Ban size={16} />
                    Cancelar chamado
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {ticketStatus !== 'CLOSED' && ticketStatus !== 'CANCELED' && (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div>
            <TextareaComponent
              id="content"
              label="Mensagem:"
              isRequired
              rows={15}
              error={errors.content?.message}
              {...register('content')}
            />
          </div>

          <FileUpload files={files} setFiles={setFiles} />

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-x-0 md:gap-x-4 gap-y-2 md:gap-y-0">
            <Button
              type="submit"
              className="flex w-full h-12 justify-center col-span-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoaderCircle size={24} className="animate-spin" />
                  <p>Aguarde um momento</p>
                </div>
              ) : (
                'Enviar Mensagem'
              )}
            </Button>

            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              asChild
              className="flex w-full h-12 justify-center"
            >
              <Link href={backUrl}>Voltar</Link>
            </Button>
          </div>
        </form>
      )}

      {rating && ticketStatus === 'CLOSED' ? (
        <TicketRatingCard
          rating={rating.rating}
          comment={rating.comment || ''}
          user={rating.user as UserData}
        />
      ) : (
        <TicketRating
          canRate={
            ticketStatus === 'CLOSED' && authorId === (user!.user.id as string)
          }
        />
      )}
    </>
  )
}
