import { ClientTemplate } from '@/_template/ClientTemplate'
import { NavUserNoAdmin } from '@/components/nav-user-no-admin'
import { EditProfileForm } from '@/components/profile-form'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const metadata = {
  title: 'Editar Perfil :: Colaborador - TechSupport',
  description: 'Editar Perfil do colaborador',
}

export default function ClientProfile() {
  return (
    <ClientTemplate>
      <header className="flex w-full h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-zinc-50 border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/cliente">
                  Chamados
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar Perfil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <NavUserNoAdmin />
      </header>

      <div className="flex items-center justify-center gap-4 px-4 pb-8 mt-8 max-w-lg mx-auto w-full">
        <EditProfileForm />
      </div>
    </ClientTemplate>
  )
}
