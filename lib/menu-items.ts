import { Users, Building, Headset, LayoutDashboard } from 'lucide-react'

export const AdminMenuItems = {
  navMain: [
    {
      title: 'Painel de Controle',
      url: '/dashboard/administrador',
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: 'Chamados',
      url: '#',
      icon: Headset,
      items: [
        {
          title: 'Todos os chamados',
          url: '/dashboard/administrador/chamados',
        },
        {
          title: 'Tipos de chamado',
          url: '/dashboard/administrador/chamados/tipos',
        },
      ],
    },
    {
      title: 'Empresas',
      url: '/dashboard/administrador/empresas',
      icon: Building,
      items: [],
    },
    {
      title: 'Usuários',
      url: '/dashboard/administrador/usuarios',
      icon: Users,
      items: [],
    },
  ],
}

export const ClientAdminMenuItems = {
  navMain: [
    {
      title: 'Painel de Controle',
      url: '/dashboard/empresa',
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: 'Chamados',
      url: '/dashboard/empresa/chamados',
      icon: Headset,
      items: [],
    },
    {
      title: 'Usuários',
      url: '/dashboard/empresa/usuarios',
      icon: Users,
      items: [],
    },
  ],
}
