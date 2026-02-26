import { ClientTemplate } from '@/_template/ClientTemplate'
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
  title: 'Detalhes do Chamado :: Colaborador - TechSupport',
  description: 'Detalhes do chamado do colaborador',
}

export default function ClientTicketDetailsPage() {
  return (
    <ClientTemplate>
      <header className="flex w-full h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-zinc-50 border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/client">
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

      <div className="flex flex-1 flex-col gap-4 px-4 pb-8 mt-8">
        <h1 className="hidden md:block">Detalhes do Chamado</h1>
        <DirectTicketDetails />
      </div>
    </ClientTemplate>
  )
}
