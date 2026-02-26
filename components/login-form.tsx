import { InputPassword } from './input-password'
import { InputText } from './input-text'
import { Button } from './ui/button'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LoaderCircle, MessageSquareText } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z
    .string()
    .nonempty('O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  password: z.string().nonempty('A senha é obrigatória.'),
})

type SignInFormProps = z.infer<typeof schema>

export const LoginForm = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormProps>({
    resolver: zodResolver(schema),
  })

  const router = useRouter()

  const handleSubmitSignInForm = useCallback(
    async (data: any) => {
      const result = await signIn('credentials', { ...data, redirect: false })

      if (result?.error) {
        toast.error(`Erro: ${result?.error}`)
      } else {
        reset()
        router.replace('/dashboard/administrador')
      }
    },
    [reset, router],
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
          Login
        </h2>

        <p className="text-center text-sm text-zinc-600">
          Insira suas credenciais para acessar o sistema.{' '}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <form
          onSubmit={handleSubmit(handleSubmitSignInForm)}
          className="space-y-6"
        >
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

          <div>
            <InputPassword
              id="password"
              label="Senha:"
              placeholder="********"
              autoComplete="off"
              isRequired
              disabled={isSubmitting}
              loading={isSubmitting}
              hasForgotPasswordLink
              error={errors.password?.message}
              {...control.register('password')}
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
              'Entrar'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
