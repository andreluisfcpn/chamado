import Image from 'next/image'
import { ResetPasswordForm } from '@/components/reset-password-form'
import { Suspense } from 'react'

export const metadata = {
  title: 'Alterar Senha - TechSupport',
}

export default function ResetPassword() {
  return (
    <Suspense>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-screen place-items-center">
          <ResetPasswordForm />

          <div className="relative hidden md:block w-full h-screen">
            <Image
              src="/suporte-cliente.jpg"
              alt="Atendimento ao Cliente"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </Suspense>
  )
}
