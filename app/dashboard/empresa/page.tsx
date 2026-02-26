import { ClientAdminTemplate } from '@/_template/ClientAdminTemplate'
import { ClientAdminDashboard } from '@/components/client-admin-dashboard'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export const metadata = {
  title: 'Painel de Controle :: Administrador da Empresa - TechSupport',
  description: 'Painel de controle do administrador da empresa',
}

export default function ClientAdminDashboardPage() {
  return (
    <ClientAdminTemplate>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Painel de Controle</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <ClientAdminDashboard />
        </div>
      </SidebarInset>
    </ClientAdminTemplate>
  )
}
