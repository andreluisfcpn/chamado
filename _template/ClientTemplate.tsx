interface ClientTemplateProps {
  children: React.ReactNode
}

export const ClientTemplate = ({ children }: ClientTemplateProps) => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-x-hidden">
      <div>{children}</div>
    </div>
  )
}
