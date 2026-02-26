import { AdminTemplate } from '@/_template/AdminTemplate'
import { TicketTypesList } from '@/components/ticket-types-datatable/get-tickettype'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'

export const metadata = {
  title: 'Tipos de chamado :: Administrador - TechSupport',
  description: 'Tipos de chamado do administrador',
}

export default async function AdminTicketTypesPage() {
  return (
    <AdminTemplate>
      <SidebarInset>
        <header className="flex h-24 md:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2 px-0 md:px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/administrador">
                      Painel de Controle
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/administrador/chamados">
                      Chamados
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Tipos de Chamado</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Button asChild>
              <Link href="/dashboard/administrador/chamados/tipos/cadastro">
                Novo Tipo de Chamado
              </Link>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 md:pt-0">
          <h1 className="hidden md:block">Tipos de Chamado</h1>
          <TicketTypesList />
        </div>
      </SidebarInset>
    </AdminTemplate>
  )
}
