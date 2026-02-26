import { TicketStatusChanged } from '@/_email-templates/ticket-status-changed'
import { authOptions } from '@/lib/auth'
import { SendEmail, transporter } from '@/lib/nodemailer'
import { prisma } from '@/lib/prisma'
import { render } from '@react-email/render'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { message: 'Usuário não autenticado.' },
      { status: 401 },
    )
  }

  const { id, status: newStatus } = await request.json()

  let statusLabel = ''
  if (newStatus === 'CLOSED') {
    statusLabel = 'Resolvido'
  } else if (newStatus === 'CANCELED') {
    statusLabel = 'Cancelado'
  } else if (newStatus === 'OPEN') {
    statusLabel = 'Reaberto'
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        title: true,
        authorId: true,
        assigneeId: true,
        status: true,
        author: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { message: 'Chamado não encontrado.' },
        { status: 404 },
      )
    }

    const updateData: any = { status: newStatus }

    if (newStatus === 'CLOSED') {
      updateData.closedAt = new Date()
    } else if (ticket.status === 'CLOSED' && newStatus !== 'CLOSED') {
      updateData.closedAt = null
    }

    await prisma.ticket.update({
      where: { id },
      data: updateData,
    })

    const commonData = {
      userName: session.user.name as string,
      ticketCode: ticket.code,
      ticketStatus: statusLabel,
      subject: `Status do chamado [#${ticket.code}] atualizado para "${statusLabel}"`,
    }

    if (ticket.authorId === session.user.id && ticket.assignee) {
      const statusChangedHTML = await render(
        TicketStatusChanged({
          ...commonData,
          userRole: 'ATENDENTE',
        }),
      )

      await transporter.sendMail(
        SendEmail({
          emailHtml: statusChangedHTML,
          email: ticket.assignee.email,
          subject: commonData.subject,
        }),
      )
    } else if (session.user.role !== 'CLIENTE') {
      const statusChangedHTML = await render(
        TicketStatusChanged({
          ...commonData,
          userRole: 'CLIENTE',
        }),
      )

      await transporter.sendMail(
        SendEmail({
          emailHtml: statusChangedHTML,
          email: ticket.author.email,
          subject: commonData.subject,
        }),
      )
    }

    return NextResponse.json(
      { message: `Status alterado para "${statusLabel}"` },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao direcionar chamado.' },
      { status: 500 },
    )
  }
}
