import { AdminTemplate } from '@/_template/AdminTemplate'
import { TicketsList } from '@/components/tickets-datatable/get-tickets'
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
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Chamados :: Administrador - TechSupport',
  description: 'Chamados do administrador',
}

export default async function AdminTicketTypesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  return (
    <AdminTemplate>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="w-full flex items-center justify-between gap-2 px-4">
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
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chamados</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <Button asChild>
              <Link href="/dashboard/administrador/chamados/cadastro">
                Novo Chamado
              </Link>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <h1 className="hidden md:block">Chamados</h1>
          <TicketsList />
        </div>
      </SidebarInset>
    </AdminTemplate>
  )
}
