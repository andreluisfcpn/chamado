'use client'

import { InputText } from './input-text'
import { Button } from './ui/button'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LoaderCircle, MessageSquareText } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { AddMinutesToCurrentTime } from '@/utils/helpers'

const schema = z.object({
  email: z
    .string()
    .nonempty('O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
})

type ForgotPasswordFormProps = z.infer<typeof schema>

export const ForgotPasswordForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordFormProps>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  const onSubmit = async (data: ForgotPasswordFormProps) => {
    await axios
      .post('/api/auth/forgot-password', {
        email: data.email,
        hashCodeExpires: AddMinutesToCurrentTime(),
      })
      .then((response) => {
        reset()
        toast.success(response.data.message)
        router.push('/')
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Erro ao enviar o e-mail')
      })
  }

  return (
    <div className="w-full sm:max-w-md flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link href="/" className="w-fit mx-auto mb-6 flex items-center gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
            <MessageSquareText className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-lg leading-tight">
            <span className="truncate font-semibold">TechSupport</span>
            <span className="truncate text-sm">Sistema de Chamado</span>
          </div>
        </Link>

        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-zinc-700 uppercase">
          Esqueci minha senha
        </h2>

        <p className="text-center text-sm text-zinc-600">
          Envie seu e-mail para receber o link de redefinição de senha.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <InputText
              id="email"
              label="E-mail"
              type="email"
              placeholder="Digite seu e-mail"
              isRequired
              disabled={isSubmitting}
              loading={isSubmitting}
              error={errors.email?.message}
              {...control.register('email')}
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
              'Enviar link de redefinição'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
