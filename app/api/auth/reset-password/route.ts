import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, newPassword, now } = await request.json()

    const existsCode = await prisma.hashCode.findFirst({
      where: {
        hashCode: code,
      },
    })

    if (!existsCode) {
      return NextResponse.json(
        { message: 'O código informado está incorreto ou não existe.' },
        { status: 400 },
      )
    }

    if (existsCode.status !== 0) {
      return NextResponse.json(
        {
          message:
            'Este código já foi utilizado. Tente fazer nova solicitação.',
        },
        { status: 400 },
      )
    }

    if (new Date(now) > new Date(existsCode.hashCodeExpires)) {
      return NextResponse.json(
        {
          message:
            'A validade desde código já expirou. Solicite novamente sua troca de senha.',
        },
        { status: 400 },
      )
    }

    const hashPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: {
        id: existsCode.userId,
      },
      data: {
        password: hashPassword,
      },
    })
    await prisma.hashCode.update({
      where: {
        id: existsCode.id,
      },
      data: {
        status: 1,
      },
    })

    return NextResponse.json(
      { message: 'Senha alterada com sucesso!' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        message:
          'Não foi possível enviar o código para o seu e-mail. Tente novamente mais tarde!',
      },
      { status: 400 },
    )
  }
}
