import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  // Adiciona suporte a paginação e filtros
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const skip = (page - 1) * limit

  // Filtros
  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  // Monta o objeto where dinamicamente
  const where: any = { companyId: session.user.companyId }

  if (code) {
    where.code = { contains: code }
  }

  if (status && status !== 'ALL') {
    where.status = status
  }

  if (priority && priority !== 'ALL') {
    where.priority = priority
  }

  try {
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        where,
        select: {
          id: true,
          title: true,
          code: true,
          status: true,
          priority: true,
          assignee: {
            select: {
              name: true,
            },
          },
          author: {
            select: {
              name: true,
            },
          },
          ticketType: {
            select: {
              name: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
          updates: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              createdAt: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ])

    return NextResponse.json({ tickets, total, page, limit }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 },
    )
  }
}
