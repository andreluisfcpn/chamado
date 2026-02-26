import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: session.user.email as string,
        },
        companyId: session.user.companyId,
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        company: { select: { name: true } },
        createdTickets: { select: { title: true } },
        assignedTickets: { select: { title: true } },
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const data = await request.json()

  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (userExists) {
      return NextResponse.json(
        { message: 'Já existe um usuário com esse e-mail.' },
        { status: 400 },
      )
    }

    const hashPassword = await hash(data.password, 12)

    const user = {
      name: data.name,
      email: data.email,
      password: hashPassword,
      role: data.userType,
      companyId: session.user?.companyId as string,
    }

    await prisma.user.create({ data: user })

    return NextResponse.json(
      { message: 'Usuário criado com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 },
    )
  }
}

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

    await prisma.user.update({
      where: { id: user.id },
      data,
    })

    return NextResponse.json(
      { message: 'Usuário atualizado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar usuário' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const { id } = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json(
      { message: 'Usuário deletado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao deletar usuário' },
      { status: 500 },
    )
  }
}
