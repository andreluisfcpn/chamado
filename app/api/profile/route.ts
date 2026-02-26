import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcrypt'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const data = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { id: data.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { message: 'Já existe um usuário com esse e-mail.' },
          { status: 400 },
        )
      }
    }

    if (data.password && data.password.trim() !== '') {
      data.password = await hash(data.password, 12)
    }

    const userData = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        name: true,
        image: true,
      },
    })

    return NextResponse.json(
      { user: userData, message: 'Perfil atualizado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar o perfil' },
      { status: 500 },
    )
  }
}
