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
  assigneeName: string
  ticketCode: string
  assignedBy: string
}

export function TicketAssigned({
  assigneeName,
  ticketCode,
  assignedBy,
}: Props) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/atendente/chamado/${ticketCode}`
  return (
    <Html lang="pt-BR">
      <Preview>Chamado atribuído: {ticketCode}</Preview>
      <Tailwind>
        <Head>
          <Font
            fontFamily="Poppins"
            fallbackFontFamily="Arial"
            webFont={{
              url: 'https://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLDz8Z11lFc-K.woff2',
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
                Novo chamado atribuído
              </Text>
              <Text className="text-sm text-slate-600 mt-2">
                Olá, {assigneeName}. O chamado <strong>{ticketCode}</strong> foi
                atribuído a você por {assignedBy}.
              </Text>
            </Section>

            <Section className="mt-6 text-center">
              <Button
                href={link}
                className="bg-orange-500 text-white px-6 py-3 rounded"
              >
                Abrir chamado
              </Button>
            </Section>

            <Section className="mt-6 text-xs text-slate-500 text-center">
              <Text>Verifique o SLA e responda o quanto antes.</Text>
            </Section>
          </Container>

          <Hr />

          <Text className="text-xs text-zinc-500 mt-6">
            TechSupport - Sistema de Chamado
          </Text>
        </Body>
      </Tailwind>
    </Html>
  )
}
