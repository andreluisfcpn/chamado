import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

interface AdminTemplateProps {
  children: React.ReactNode
}

export const AdminTemplate = ({ children }: AdminTemplateProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  )
}
