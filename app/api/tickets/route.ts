import { NewTicket } from '@/_email-templates/new-ticket'
import { NewTicketClient } from '@/_email-templates/new-ticket-client'
import { TicketAssigned } from '@/_email-templates/ticket-assigned'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary-config'
import { SendEmail, transporter } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'
import { calculateSlaDeadlines } from '@/utils/sla-helpers'
import { render } from '@react-email/render'
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
  const where: any = {}
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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const { title, ticketTypeId, priority, content, ticketFiles } =
    await request.json()

  if (!title || !ticketTypeId || !content) {
    return NextResponse.json(
      { message: 'Dados incompletos. Verifique os campos obrigatórios.' },
      { status: 400 },
    )
  }

  const code = `CH-${Math.floor(100000 + Math.random() * 900000).toString()}`

  const existingTicket = await prisma.ticket.findUnique({
    where: { code },
  })

  if (existingTicket) {
    return NextResponse.json(
      { message: 'Erro ao gerar código do chamado. Tente novamente.' },
      { status: 500 },
    )
  }

  try {
    const { slaResponseDeadline, slaSolutionDeadline } =
      await calculateSlaDeadlines(ticketTypeId)

    const ticket = await prisma.ticket.create({
      data: {
        title,
        ticketTypeId,
        priority,
        code,
        authorId: session.user.id,
        companyId: session.user.companyId as string,
        slaResponseDeadline,
        slaSolutionDeadline,
        slaStatus: 'WITHIN_DEADLINE',
      },
      select: {
        id: true,
        code: true,
        title: true,
        ticketType: { select: { name: true } },
      },
    })

    const ticketUpdate = await prisma.ticketUpdate.create({
      data: {
        content,
        ticketId: ticket.id,
        senderId: session.user.id,
      },
    })

    if (ticketFiles && ticketFiles.length > 0) {
      const uploadPromises = ticketFiles.map(async (file: string) => {
        const result = await cloudinary.uploader.upload(file, {
          folder: 'chamado',
        })
        return {
          file: result.secure_url,
          ticketUpdateId: ticketUpdate.id,
        }
      })

      const filesData = await Promise.all(uploadPromises)

      await prisma.ticketUpdateFiles.createMany({
        data: filesData,
      })
    }

    const internalUsers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMINISTRADOR', 'ATENDENTE'] },
      },
      select: { name: true, email: true, role: true },
    })

    const newTicketClientHTML = await render(
      NewTicketClient({ name: session.user.name as string, code: ticket.code }),
    )

    await transporter.sendMail(
      SendEmail({
        emailHtml: newTicketClientHTML,
        email: session.user.email as string,
        subject: `[#${ticket.code}] Novo chamado criado: ${ticket.title}`,
      }),
    )

    internalUsers.forEach(async (user) => {
      await transporter.sendMail(
        SendEmail({
          emailHtml: await render(
            NewTicket({
              name: user.name,
              code: ticket.code,
              role: user.role,
              title: ticket.title,
              ticketType: ticket.ticketType.name,
              message: content,
            }),
          ),
          email: user.email,
          subject: `[#${ticket.code}] Novo chamado criado: ${ticket.title}`,
        }),
      )
    })

    return NextResponse.json(
      { message: 'Chamado criado com sucesso!' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar chamado.' },
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

  const { id, atendente } = await request.json()

  if (!id || !atendente) {
    return NextResponse.json(
      { message: 'Dados incompletos. Verifique os campos obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assigneeId: atendente },
      select: {
        id: true,
        code: true,
        assignee: { select: { name: true, email: true } },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    const ticketAssignedHTML = await render(
      TicketAssigned({
        assigneeName: ticket.assignee!.name,
        ticketCode: ticket.code,
        assignedBy: session.user.name as string,
      }),
    )

    await transporter.sendMail(
      SendEmail({
        emailHtml: ticketAssignedHTML,
        email: ticket.assignee!.email,
        subject: `Chamado [#${ticket.code}] atribuído a você.`,
      }),
    )

    return NextResponse.json(
      { message: 'Chamado direcionado com sucesso!' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao direcionar chamado.' },
      { status: 500 },
    )
  }
}
