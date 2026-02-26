'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { InputPassword } from '../input-password'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { User } from '@prisma/client'
import { SelectForm } from '../select-form'
import { statuses } from '@/lib/data'
import Link from 'next/link'

const fetcherUser = async ([url, id]: any) =>
  await axios.get(url, { params: { id } }).then((res) => res.data)

const schema = z.object({
  name: z.string().nonempty('O nome é obrigatório.'),
  status: z.string().nonempty('O status é obrigatório.'),
  email: z.string(),
  password: z.string(),
})

type EditUserFormValues = z.infer<typeof schema>

export function EditUserForm() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const { data: userData, isLoading: isLoadingUser } = useSWR(
    ['/api/users/user', params.id],
    fetcherUser,
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const user = userData?.user || ({} as User)

    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: user.password,
        status: user.status,
      })
    }
  }, [userData, reset])

  const onSubmit = async (data: EditUserFormValues) => {
    let dataToSend = {}

    if (data.password === '') {
      // eslint-disable-next-line no-unused-vars
      const { password, ...rest } = data
      dataToSend = { ...rest, id: userData?.user.id }
    } else {
      dataToSend = { ...data, id: userData?.user.id }
    }

    await axios
      .patch('/api/users', dataToSend)
      .then((response) => {
        reset()
        toast.success(response.data.message)
        router.push('/dashboard/administrador/usuarios')
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || 'Erro ao adicionar o usuário',
        )
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div>
        <InputText
          id="name"
          label="Nome Completo"
          isRequired
          placeholder="Digite o nome completo"
          error={errors.name?.message}
          {...register('name')}
          disabled={isSubmitting || isLoadingUser}
          loading={isSubmitting || isLoadingUser}
        />
      </div>

      <div>
        <InputText
          id="email"
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          isRequired
          error={errors.email?.message}
          {...register('email')}
          disabled
          loading={isSubmitting || isLoadingUser}
        />
      </div>

      <div>
        <InputPassword
          id="password"
          label="Senha:"
          placeholder="********"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
          disabled={isSubmitting || isLoadingUser}
          loading={isSubmitting || isLoadingUser}
        />
      </div>

      <div>
        <Controller
          name="status"
          control={control}
          defaultValue={userData?.user.status || ''}
          render={({ field: { onChange, value } }) => (
            <SelectForm
              items={statuses}
              label="uma opção"
              fieldName="Status:"
              error={errors.status?.message}
              isRequired
              itemSelected={onChange}
              value={value}
              isLoading={isSubmitting || isLoadingUser}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        className="flex w-full h-12 justify-center"
        disabled={isSubmitting || isLoadingUser}
      >
        {isSubmitting || isLoadingUser ? (
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
        <Link href="/dashboard/administrador/usuarios">Cancelar</Link>
      </Button>
    </form>
  )
}
