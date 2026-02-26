import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

type Props = {
  senderName: string
  ticketCode: string
  content: string
  userRole: 'CLIENTE' | 'ATENDENTE'
}

export function TicketUpdated({
  senderName,
  ticketCode,
  content,
  userRole,
}: Props) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${userRole === 'CLIENTE' ? 'cliente' : 'atendente'}/chamado/${ticketCode}`
  return (
    <Html lang="pt-BR">
      <Preview>Novo comentário no chamado {ticketCode}</Preview>
      <Tailwind>
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="Arial"
            webFont={{
              url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3i6V7jB9sC2.woff2',
              format: 'woff2',
            }}
          />
        </Head>
        <Body className="bg-slate-50 py-12">
          <Container className="bg-white rounded-lg p-6 mx-auto max-w-lg">
            <Img
              src="https://res.cloudinary.com/mikedevanorak/image/upload/v1760763194/chamado/logo-tech-support_etsgko.png"
              width="160"
              height="32"
              alt="Logo"
              className="mx-auto"
            />
            <Section className="mt-6 text-center">
              <Text className="text-lg font-semibold">
                Atualização no chamado
              </Text>
              <Text className="text-sm text-slate-600 mt-2">
                {senderName} adicionou uma nova mensagem no chamado{' '}
                <strong>{ticketCode}</strong>.
              </Text>
            </Section>

            <Section className="mt-4">
              <Text className="text-sm text-slate-700 italic">
                &quot;{content}&quot;
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Button
                href={link}
                className="bg-orange-500 text-white px-6 py-3 rounded"
              >
                Ver atualização
              </Button>
            </Section>

            <Hr />

            <Text className="text-xs text-zinc-500 mt-6">
              TechSupport - Sistema de Chamado
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
