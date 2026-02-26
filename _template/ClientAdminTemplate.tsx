import { AppSidebarClientAdmin } from '@/components/app-sidebar-client-admin'
import { SidebarProvider } from '@/components/ui/sidebar'

interface ClientAdminTemplateProps {
  children: React.ReactNode
}

export const ClientAdminTemplate = ({ children }: ClientAdminTemplateProps) => {
  return (
    <SidebarProvider>
      <AppSidebarClientAdmin />
      {children}
    </SidebarProvider>
  )
}
