import { AgentTemplate } from '@/_template/AgentTemplate'
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
  title: 'Editar Perfil :: Atendente - TechSupport',
  description: 'Editar Perfil do atendente',
}

export default function AgentProfile() {
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
    </AgentTemplate>
  )
}
