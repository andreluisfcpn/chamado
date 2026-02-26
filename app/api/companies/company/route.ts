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

  const id = request.nextUrl.searchParams.get('id')!

  try {
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
        availableTypes: {
          select: {
            ticketTypeId: true,
          },
        },
      },
    })
    if (!company) {
      return NextResponse.json(
        { message: 'Empresa não encontrada.' },
        { status: 404 },
      )
    }
    return NextResponse.json({ company }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar empresa' },
      { status: 500 },
    )
  }
}
