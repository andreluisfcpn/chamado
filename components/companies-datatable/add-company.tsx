'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useSWR from 'swr'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { TicketType } from '@prisma/client'
import { SelectForm } from '../select-form'
import { InputPassword } from '../input-password'
import Link from 'next/link'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const schema = z
  .object({
    name: z.string().nonempty('O nome é obrigatório.'),
    ticketTypes: z
      .array(z.string())
      .min(1, 'Selecione ao menos um tipo de chamado'),
    addUser: z.string(),
    userName: z.string(),
    userEmail: z.string(),
    userPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.addUser === 'sim') {
      if (!data.userName) {
        ctx.addIssue({
          path: ['userName'],
          code: z.ZodIssueCode.custom,
          message:
            'O nome é obrigatório quando for cadastrar um administrador.',
        })
      }
      if (!data.userEmail) {
        ctx.addIssue({
          path: ['userEmail'],
          code: z.ZodIssueCode.custom,
          message:
            'O e-mail é obrigatório quando for cadastrar um administrador.',
        })
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail)) {
        ctx.addIssue({
          path: ['userEmail'],
          code: z.ZodIssueCode.custom,
          message: 'Formato de e-mail inválido.',
        })
      }
      if (!data.userPassword) {
        ctx.addIssue({
          path: ['userPassword'],
          code: z.ZodIssueCode.custom,
          message:
            'A senha é obrigatória quando for cadastrar um administrador.',
        })
      }
    }
  })

export type AddCompanyFormValues = z.infer<typeof schema>

export function AddCompanyForm() {
  const { data, isLoading } = useSWR('/api/ticket-types', fetcher)
  const { mutate } = useSWR('/api/companies', fetcher)

  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddCompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      addUser: 'nao',
      name: '',
      ticketTypes: [],
      userEmail: '',
      userName: '',
      userPassword: '',
    },
  })

  const onSubmit = async (data: AddCompanyFormValues) => {
    await axios
      .post('/api/companies', data)
      .then((response) => {
        reset()
        mutate('/api/companies')
        toast.success(response.data.message)
        router.push('/dashboard/administrador/empresas')
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar a empresa',
        )
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <InputText
          id="name"
          label="Nome da Empresa"
          isRequired
          placeholder="Digite o nome da empresa"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
      <div>
        <Label className="mb-3 block">
          Tipos de Chamado da Empresa: <span className="text-red-500">*</span>
        </Label>
        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <Controller
            name="ticketTypes"
            control={control}
            defaultValue={[]}
            render={({ field: { value = [], onChange } }) => {
              return (
                <div className="grid grid-cols-2 gap-6">
                  {data?.ticketTypes.map((ticketType: TicketType) => (
                    <div
                      key={ticketType.id}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        id={`ticket-type-${ticketType.id}`}
                        checked={value.includes(ticketType.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onChange([...value, ticketType.id])
                          } else {
                            onChange(value.filter((id) => id !== ticketType.id))
                          }
                        }}
                      />
                      <Label htmlFor={`ticket-type-${ticketType.id}`}>
                        {ticketType.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )
            }}
          />
        )}
        {errors.ticketTypes && (
          <p className="mt-2 text-sm text-red-600">
            {errors.ticketTypes.message}
          </p>
        )}
      </div>
      <Controller
        name="addUser"
        control={control}
        defaultValue="nao"
        render={({ field: { onChange, value } }) => (
          <SelectForm
            items={[
              { label: 'Não', value: 'nao' },
              { label: 'Sim', value: 'sim' },
            ]}
            label="uma opção"
            fieldName="Cadastrar administrador:"
            error={errors.addUser?.message}
            isRequired
            itemSelected={onChange}
            defaultValue={value}
          />
        )}
      />
      {watch('addUser') === 'sim' && (
        <>
          <div>
            <InputText
              id="userName"
              label="Nome Completo"
              isRequired
              defaultValue=""
              placeholder="Digite o nome completo"
              error={errors.userName?.message}
              {...register('userName')}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
          <div>
            <InputText
              id="userEmail"
              label="E-mail"
              type="email"
              isRequired
              defaultValue=""
              placeholder="Digite seu e-mail"
              error={errors.userEmail?.message}
              {...register('userEmail')}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
          <div>
            <InputPassword
              id="userPassword"
              label="Senha:"
              autoComplete="new-password"
              isRequired
              defaultValue=""
              placeholder="********"
              error={errors.userPassword?.message}
              {...register('userPassword')}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </>
      )}
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
          'Cadastrar Empresa'
        )}
      </Button>

      <Button
        variant="outline"
        className="flex w-full h-12 justify-center md:hidden mt-2"
        asChild
      >
        <Link href="/dashboard/administrador/empresas">Cancelar</Link>
      </Button>
    </form>
  )
}
