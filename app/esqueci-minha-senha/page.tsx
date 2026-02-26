import Image from 'next/image'
import { ForgotPasswordForm } from '@/components/forgot-password-form'

export const metadata = {
  title: 'Esqueci minha senha - TechSupport',
}

export default function ForgotPassword() {
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-screen place-items-center">
        <ForgotPasswordForm />

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
  )
}
