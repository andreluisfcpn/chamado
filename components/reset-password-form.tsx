/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCallback } from 'react'
import { Button } from './ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentTimeUTC } from '@/utils/helpers'
import axios from 'axios'
import { LoaderCircle, MessageSquareText } from 'lucide-react'
import { toast } from 'sonner'
import { InputPassword } from './input-password'
import Link from 'next/link'

const schema = z
  .object({
    newPassword: z.string().nonempty('A nova senha é obrigatória.'),
    confirmNewPassword: z
      .string()
      .nonempty('Confirmar nova senha é obrigatório.'),
  })
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmNewPassword'],
        message: 'As senhas não combinam.',
      })
    }
  })

type ResetPasswordProps = z.infer<typeof schema>

export function ResetPasswordForm() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordProps>({
    resolver: zodResolver(schema),
  })
  const router = useRouter()

  const search = useSearchParams()
  const code = search.get('code')

  const handleSendForm = useCallback(
    async (data: any) => {
      const newData = {
        ...data,
        code,
        now: getCurrentTimeUTC(),
      }

      await axios
        .post('/api/auth/reset-password', newData)
        .then((response) => {
          toast.success(response.data.message)
          reset()
          router.replace('/')
        })
        .catch((error) => {
          toast.error(error.response.data.message)
        })
    },
    [reset],
  )

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
          Alterar Senha
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <form className="space-y-6" onSubmit={handleSubmit(handleSendForm)}>
          <div className="w-full">
            <Controller
              name="newPassword"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <InputPassword
                  value={value}
                  label="Nova Senha"
                  placeholder="***********"
                  isRequired
                  onChange={onChange}
                  disabled={isSubmitting}
                />
              )}
            />

            {errors.newPassword && (
              <small className="text-red-500">
                {errors.newPassword.message}
              </small>
            )}
          </div>

          <div className="w-full">
            <Controller
              name="confirmNewPassword"
              control={control}
              defaultValue=""
              render={({ field: { onChange, value } }) => (
                <InputPassword
                  value={value}
                  label="Confirmar Nova Senha"
                  placeholder="***********"
                  isRequired
                  onChange={onChange}
                  disabled={isSubmitting}
                />
              )}
            />

            {errors.confirmNewPassword && (
              <small className="text-red-500">
                {errors.confirmNewPassword.message}
              </small>
            )}
          </div>

          <Button className="w-full h-12" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <LoaderCircle size={24} className="animate-spin" />
                <p>Aguarde um momento</p>
              </div>
            ) : (
              'Alterar Senha'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
