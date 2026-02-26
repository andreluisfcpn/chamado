import { ForgotPassword } from '@/_email-templates/forgot-password'
import { SendEmail } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/render'
import { transporter } from '@/lib/nodemailer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const { email, hashCodeExpires } = await request.json()

  if (!email) {
    return NextResponse.json(
      { message: 'O e-mail é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { message: 'E-mail não encontrado.' },
        { status: 404 },
      )
    }

    const existsHashCode = await prisma.hashCode.findFirst({
      where: {
        userId: user.id,
      },
    })

    const hashCode = crypto.randomUUID()

    if (!existsHashCode) {
      await prisma.hashCode.create({
        data: {
          userId: user.id,
          hashCode,
          hashCodeExpires,
        },
      })
    } else {
      await prisma.hashCode.update({
        where: {
          userId: user.id,
        },
        data: {
          hashCode,
          hashCodeExpires,
          status: 0,
        },
      })
    }

    const resetPasswordHTML = await render(
      ForgotPassword({ name: user.name, hash: hashCode }),
    )

    await transporter.sendMail(
      SendEmail({
        emailHtml: resetPasswordHTML,
        email,
        subject: 'Redefinição de Senha',
      }),
    )

    return NextResponse.json(
      { message: 'E-mail de recuperação de senha enviado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao enviar e-mail.' },
      { status: 500 },
    )
  }
}
