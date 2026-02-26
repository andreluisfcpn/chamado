'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { InputText } from '../input-text'
import { InputPassword } from '../input-password'
import { Button } from '../ui/button'
import { LoaderCircle } from 'lucide-react'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  name: z.string().nonempty('O nome é obrigatório.'),
  email: z
    .string()
    .nonempty('O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  password: z.string().nonempty('A senha é obrigatória.'),
  userType: z.enum(['CLIENTE', 'ADMINISTRADOR_EMPRESA'], {
    errorMap: () => ({ message: 'O tipo de usuário é obrigatório.' }),
  }),
})

type AddUserFormValues = z.infer<typeof schema>

export function AddCompanyUserForm() {
  const router = useRouter()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: AddUserFormValues) => {
    await axios
      .post('/api/users/company', data)
      .then((response) => {
        reset()
        toast.success(response.data.message)
        router.push('/dashboard/empresa/usuarios')
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
          disabled={isSubmitting}
          loading={isSubmitting}
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
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
      <div>
        <InputPassword
          id="password"
          label="Senha:"
          placeholder="********"
          autoComplete="new-password"
          isRequired
          error={errors.password?.message}
          {...register('password')}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
      <div>
        <Label htmlFor="userType" className="mb-2 block">
          Tipo de Usuário: <span className="text-red-600">*</span>
        </Label>
        <Controller
          name="userType"
          control={control}
          defaultValue={undefined}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              value={value}
              onValueChange={onChange}
              className="flex items-center gap-4 mt-1"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="CLIENTE" id="r1" />
                <Label htmlFor="r1">Colaborador</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="ADMINISTRADOR_EMPRESA" id="r2" />
                <Label htmlFor="r2">Administrador</Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.userType && (
          <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
        )}
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
          'Cadastrar Usuário'
        )}
      </Button>

      <Button
        variant="outline"
        className="flex w-full h-12 justify-center mt-2 md:hidden"
        asChild
      >
        <Link href="/dashboard/empresa/usuarios">Cancelar</Link>
      </Button>
    </form>
  )
}
