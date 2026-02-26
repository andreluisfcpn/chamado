import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

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
    where: {
      assignedToCompanies: { some: { companyId: session.user.companyId } },
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      tickets: { select: { title: true } },
    },
  })

  return NextResponse.json({ ticketTypes }, { status: 200 })
}
