'use client'

import Image from 'next/image'
import { LoginForm } from '@/components/login-form'

export default function Login() {
  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-screen place-items-center">
        {/* Formulário de Login */}
        <LoginForm />

        {/* Imagem de Atendimento */}
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
