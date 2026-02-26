import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const skip = (page - 1) * limit

  const name = searchParams.get('name')

  const loggedUserCompanyId = await prisma.user
    .findUnique({ where: { email: session.user?.email || '' } })
    .then((user) => user?.companyId)

  const where: any = { NOT: { id: loggedUserCompanyId } }

  if (name) {
    where.name = { contains: name }
  }

  const companies = await prisma.company.findMany({
    where,
    skip,
    take: limit,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      tickets: {
        select: {
          title: true,
        },
      },
      users: {
        where: {
          id: {
            not: session?.user.id,
          },
        },
        select: {
          name: true,
        },
      },
    },
  })

  return NextResponse.json({ companies }, { status: 200 })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const data = await request.json()

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  if (!data.name || data.name.trim() === '') {
    return NextResponse.json(
      { message: 'O nome da empresa é obrigatório.' },
      { status: 400 },
    )
  }

  if (
    !data.ticketTypes ||
    !Array.isArray(data.ticketTypes) ||
    data.ticketTypes.length === 0
  ) {
    return NextResponse.json(
      { message: 'Selecione ao menos um tipo de chamado.' },
      { status: 400 },
    )
  }

  const existingCompany = await prisma.company.findUnique({
    where: { name: data.name },
  })

  if (existingCompany) {
    return NextResponse.json(
      { message: 'Já existe uma empresa com esse nome.' },
      { status: 400 },
    )
  }

  if (data.addUser === 'sim') {
    if (
      !data.userName ||
      data.userName.trim() === '' ||
      !data.userEmail ||
      data.userEmail.trim() === '' ||
      !data.userPassword ||
      data.userPassword.trim() === ''
    ) {
      return NextResponse.json(
        { message: 'Dados do usuário incompletos.' },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.userEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Já existe um usuário com esse e-mail.' },
        { status: 400 },
      )
    }
  }

  const types = data.ticketTypes.map((id: string) => ({ id }))

  try {
    const company = await prisma.company.create({ data: { name: data.name } })

    await prisma.companyTicketType.createMany({
      data: types.map((type: any) => ({
        companyId: company.id,
        ticketTypeId: type.id,
        assignedBy: session.user?.email || 'system',
      })),
      skipDuplicates: true,
    })

    if (data.addUser === 'sim') {
      const hashedPassword = await hash(data.userPassword, 12)

      await prisma.user.create({
        data: {
          name: data.userName,
          email: data.userEmail,
          password: hashedPassword,
          role: 'ADMINISTRADOR_EMPRESA',
          companyId: company.id,
        },
      })
    }

    return NextResponse.json(
      { message: 'Empresa criada com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar a empresa.' },
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

  if (!data.name || data.name.trim() === '') {
    return NextResponse.json(
      { message: 'O nome da empresa é obrigatório.' },
      { status: 400 },
    )
  }

  if (
    !data.ticketTypes ||
    !Array.isArray(data.ticketTypes) ||
    data.ticketTypes.length === 0
  ) {
    return NextResponse.json(
      { message: 'Selecione ao menos um tipo de chamado.' },
      { status: 400 },
    )
  }

  const existingCompany = await prisma.company.findUnique({
    where: { name: data.name },
  })

  if (existingCompany && existingCompany.id !== data.id) {
    return NextResponse.json(
      { message: 'Já existe uma empresa com esse nome.' },
      { status: 400 },
    )
  }

  const types = data.ticketTypes.map((id: string) => ({ id }))

  try {
    const company = await prisma.company.update({
      where: { id: data.id },
      data: { name: data.name, status: data.status },
    })

    await prisma.user.updateMany({
      where: { companyId: company.id },
      data: { status: data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' },
    })

    await prisma.companyTicketType.deleteMany({
      where: { companyId: company.id },
    })

    await prisma.companyTicketType.createMany({
      data: types.map((type: any) => ({
        companyId: company.id,
        ticketTypeId: type.id,
        assignedBy: session.user?.email || 'system',
      })),
      skipDuplicates: true,
    })

    return NextResponse.json(
      { message: 'Empresa atualizada com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao atualizar a empresa.' },
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

  const data = await request.json()

  if (!data.id || data.id.trim() === '') {
    return NextResponse.json(
      { message: 'ID da empresa é obrigatório.' },
      { status: 400 },
    )
  }

  const company = await prisma.company.findUnique({
    where: { id: data.id },
    select: {
      id: true,
      users: { select: { id: true } },
      tickets: { select: { id: true } },
      availableTypes: { select: { companyId: true } },
    },
  })

  if (!company) {
    return NextResponse.json(
      { message: 'Empresa não encontrada.' },
      { status: 404 },
    )
  }

  if (company.users.length > 0 || company.tickets.length > 0) {
    await prisma.company.update({
      where: { id: company.id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json(
      {
        message:
          'Empresa desativada por ter usuários e/ou chamados vinculados a ela.',
      },
      { status: 200 },
    )
  }

  if (company.availableTypes.length > 0) {
    await prisma.companyTicketType.deleteMany({
      where: { companyId: company.id },
    })
  }

  try {
    await prisma.company.delete({ where: { id: data.id } })

    return NextResponse.json(
      { message: 'Empresa excluída com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao excluir a empresa.' },
      { status: 500 },
    )
  }
}
