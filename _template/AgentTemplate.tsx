interface AgentTemplateProps {
  children: React.ReactNode
}

export const AgentTemplate = ({ children }: AgentTemplateProps) => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-x-hidden">
      <div>{children}</div>
    </div>
  )
}
