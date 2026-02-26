import { AgentTemplate } from '@/_template/AgentTemplate'
import { NavUserNoAdmin } from '@/components/nav-user-no-admin'
import { AgentTicketsList } from '@/components/tickets-datatable/get-tickets-agent'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

export const metadata = {
  title: 'Painel de Controle :: Atendente - TechSupport',
  description: 'Painel de controle do atendente',
}

export default function AgentDashboardPage() {
  return (
    <AgentTemplate>
      <header className="flex w-full h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-zinc-50 border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Chamados</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <NavUserNoAdmin />
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-8 mt-8">
        <AgentTicketsList />
      </div>
    </AgentTemplate>
  )
}
