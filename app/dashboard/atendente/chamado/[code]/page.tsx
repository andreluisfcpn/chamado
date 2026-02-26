import { AgentTemplate } from '@/_template/AgentTemplate'
import { NavUserNoAdmin } from '@/components/nav-user-no-admin'
import { DirectTicketDetails } from '@/components/tickets-datatable/ticket-details'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const metadata = {
  title: 'Detalhes do Chamado :: Atendente - TechSupport',
  description: 'Detalhes do chamado do atendente',
}

export default function AgentTicketDetailsPage() {
  return (
    <AgentTemplate>
      <header className="flex w-full h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/atendente">
                  Chamados
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detalhes do Chamado</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <NavUserNoAdmin />
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-8">
        <h1 className="hidden md:block">Detalhes do Chamado</h1>
        <DirectTicketDetails />
      </div>
    </AgentTemplate>
  )
}
