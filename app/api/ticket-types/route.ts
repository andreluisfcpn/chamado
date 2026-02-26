import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const ticketTypes = await prisma.ticketType.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      description: true,
      slaResponseTime: true,
      slaSolutionTime: true,
      createdAt: true,
      tickets: { select: { title: true } },
    },
  })

  return NextResponse.json({ ticketTypes }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  try {
    const data = await request.json()
    const { name, description, slaResponseTime, slaSolutionTime } = data

    const typeExists = await prisma.ticketType.findUnique({
      where: {
        name: name,
      },
    })

    if (typeExists) {
      return NextResponse.json(
        { message: 'Tipo de chamado já existe!' },
        { status: 409 },
      )
    }

    await prisma.ticketType.create({
      data: {
        name,
        description,
        slaResponseTime,
        slaSolutionTime,
      },
    })

    return NextResponse.json(
      { message: 'Tipo de chamado criado com sucesso!' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar tipo de chamado' },
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

  try {
    const data = await request.json()
    const { id, name, description, slaResponseTime, slaSolutionTime } = data

    const typeExists = await prisma.ticketType.findUnique({
      where: {
        id,
      },
    })

    if (!typeExists) {
      return NextResponse.json(
        { message: 'Tipo de chamado não encontrado.' },
        { status: 404 },
      )
    }

    const nameAlreadyExists = await prisma.ticketType.findFirst({
      where: {
        name,
        id: { not: id },
      },
    })

    if (nameAlreadyExists) {
      return NextResponse.json(
        { message: 'Nome do tipo de chamado já está em uso.' },
        { status: 409 },
      )
    }

    await prisma.ticketType.update({
      where: { id },
      data: {
        name,
        description,
        slaResponseTime,
        slaSolutionTime,
      },
    })

    return NextResponse.json(
      { message: 'Tipo de chamado atualizado com sucesso!' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar tipo de chamado' },
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

  try {
    const id = request.nextUrl.searchParams.get('id')!

    const typeExists = await prisma.ticketType.findUnique({
      where: { id },
      include: { tickets: true },
    })

    if (!typeExists) {
      return NextResponse.json(
        { message: 'Tipo de chamado não encontrado.' },
        { status: 404 },
      )
    }

    if (typeExists.tickets.length > 0) {
      return NextResponse.json(
        {
          message:
            'Não é possível excluir este tipo de chamado, pois existem chamados associados a ele.',
        },
        { status: 400 },
      )
    }

    await prisma.ticketType.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Tipo de chamado excluído com sucesso!' },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro ao excluir tipo de chamado' },
      { status: 500 },
    )
  }
}
