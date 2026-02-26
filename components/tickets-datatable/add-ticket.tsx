'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import { TicketType } from '@prisma/client'
import { SelectForm } from '../select-form'
import { InputText } from '../input-text'
import { TicketPriorityOptions } from '@/lib/form-options'
import { TextareaComponent } from '../textarea'
import { useState } from 'react'
import { transformFileToBase64 } from '@/utils/helpers'
import { FileUpload } from '../file-upload'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const schema = z.object({
  title: z.string().nonempty('O título é obrigatório.'),
  ticketTypeId: z.string().nonempty('O tipo de chamado é obrigatório.'),
  priority: z.string(),
  content: z.string().nonempty('A descrição detalhada é obrigatória.'),
})

export type AddTicketFormValues = z.infer<typeof schema>

export function AddTicketForm() {
  const { data, isLoading } = useSWR('/api/ticket-types', fetcher)

  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTicketFormValues>({
    resolver: zodResolver(schema),
  })

  const [files, setFiles] = useState<File[]>([])

  const onSubmit = async (data: AddTicketFormValues) => {
    try {
      const filesBase64 = await transformFileToBase64(files)

      await axios
        .post('/api/tickets', {
          ...data,
          ticketFiles: filesBase64,
        })
        .then((response) => {
          reset()
          toast.success(response.data.message)
          router.push('/dashboard/administrador/chamados')
          setFiles([])
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message || 'Erro ao adicionar a chamado',
          )
        })
    } catch (error) {
      toast.error('Erro ao processar os arquivos')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <InputText
          id="title"
          label="Título do chamado"
          isRequired
          placeholder="Digite o título do seu chamado"
          error={errors.title?.message}
          {...register('title')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>

      <Controller
        name="ticketTypeId"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <SelectForm
            items={data?.ticketTypes.map((type: TicketType) => ({
              label: type.name,
              value: type.id,
            }))}
            isLoading={isLoading || isSubmitting}
            label="um tipo de chamado"
            fieldName="Tipo de chamado"
            error={errors.ticketTypeId?.message}
            isRequired
            itemSelected={onChange}
            defaultValue={value}
          />
        )}
      />

      <Controller
        name="priority"
        control={control}
        defaultValue="LOW"
        render={({ field: { onChange, value } }) => (
          <SelectForm
            items={TicketPriorityOptions}
            label="uma prioridade"
            fieldName="Prioridade"
            itemSelected={onChange}
            defaultValue={value}
            isLoading={isSubmitting}
          />
        )}
      />

      <FileUpload files={files} setFiles={setFiles} />

      <div>
        <TextareaComponent
          id="content"
          label="Descrição detalhada"
          isRequired
          error={errors.content?.message}
          placeholder='Descreva detalhadamente o problema que você está enfrentando. Por exemplo: "Estou tendo dificuldades para acessar minha conta, pois esqueci minha senha e o link de recuperação não está funcionando."'
          {...register('content')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
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
          'Cadastrar Chamado'
        )}
      </Button>
    </form>
  )
}
