import { TicketUpdated } from '@/_email-templates/ticket-updated'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary-config'
import { SendEmail, transporter } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'
import { updateTicketSlaStatus } from '@/utils/sla-helpers'
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

  const code = request.nextUrl.searchParams.get('code')!

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      select: {
        id: true,
        title: true,
        code: true,
        status: true,
        priority: true,
        slaStatus: true,
        slaResponseDeadline: true,
        slaSolutionDeadline: true,
        firstResponseAt: true,
        closedAt: true,
        ticketType: {
          select: {
            name: true,
            slaResponseTime: true,
            slaSolutionTime: true,
          },
        },
        assignee: { select: { name: true, image: true } },
        author: { select: { id: true, name: true, image: true } },
        company: { select: { name: true } },
        createdAt: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          select: {
            sender: { select: { name: true, id: true } },
            content: true,
            createdAt: true,
            files: {
              select: { file: true },
            },
          },
        },
        ticketRatings: {
          select: {
            rating: true,
            comment: true,
            user: { select: { name: true, image: true } },
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ ticket }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar detalhes do chamado.' },
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

  const { id, content, ticketFiles } = await request.json()

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        assigneeId: true,
        authorId: true,
        status: true,
        firstResponseAt: true,
        assignee: { select: { name: true, email: true } },
        author: { select: { name: true, email: true } },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    const userRole = session.user.role
    const isSupport = ['ADMINISTRADOR', 'ATENDENTE'].includes(userRole ?? '')
    const ticketStatus = isSupport ? 'PENDING_CLIENT' : 'IN_PROGRESS'

    let assigneeData = {}
    let slaUpdateData = {}

    const hasNoAssignee = ticket.assigneeId === null
    const isDifferentAssignee =
      ticket.assigneeId !== null && ticket.assigneeId !== session.user.id
    const shouldTakeOwnership =
      isSupport && (hasNoAssignee || isDifferentAssignee)

    if (shouldTakeOwnership) {
      assigneeData = { assigneeId: session.user.id }
    }

    // Se é uma resposta do suporte e ainda não foi definida a primeira resposta
    if (isSupport && !ticket.firstResponseAt) {
      slaUpdateData = { firstResponseAt: new Date() }
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: ticketStatus,
        ...assigneeData,
        ...slaUpdateData,
      },
    })

    const ticketUpdate = await prisma.ticketUpdate.create({
      data: {
        content,
        senderId: session.user.id,
        ticketId: ticket.id,
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

    // Atualizar status SLA após adicionar mensagem
    await updateTicketSlaStatus(ticket.id)

    const commonData = {
      senderName: session.user.name as string,
      ticketCode: ticket.code,
      content,
      userRole,
      subject: `Atualização no chamado [#${ticket.code}]`,
      email: '',
    }

    let ticketUpdatedHTML = ''

    if (ticket.authorId === session.user.id && ticket.assignee) {
      ticketUpdatedHTML = await render(
        TicketUpdated({
          ...commonData,
          userRole: 'ATENDENTE',
        }),
      )

      commonData.email = ticket.assignee.email
    } else if (session.user.role !== 'CLIENTE') {
      ticketUpdatedHTML = await render(
        TicketUpdated({
          ...commonData,
          userRole: 'CLIENTE',
        }),
      )

      commonData.email = ticket.author.email
    }

    await transporter.sendMail(
      SendEmail({
        emailHtml: ticketUpdatedHTML,
        email: commonData.email,
        subject: commonData.subject,
      }),
    )

    return NextResponse.json(
      { message: 'Mensagem inserida com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar chamado.' },
      { status: 500 },
    )
  }
}
