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

type NewTicketProps = {
  name: string
  code: string
}

export function NewTicketClient({ name, code }: NewTicketProps) {
  return (
    <Html lang="pt-BR">
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
      <Preview>Novo Chamado Criado</Preview>
      <Tailwind>
        <Body className="bg-orange-500 py-20 h-fit flex items-center justify-center">
          <Container className="bg-white rounded-lg px-10 py-8 flex flex-col">
            <Img
              src={`https://res.cloudinary.com/mikedevanorak/image/upload/v1760763194/chamado/logo-tech-support_etsgko.png`}
              width="202"
              height="40"
              alt="Logo TechSupport"
              className="m-auto"
            />

            <Section className="mt-8 text-center">
              <Text className="text-lg font-semibold text-zinc-500 leading-4">
                Olá, {name}!
              </Text>

              <Text className="text-base text-zinc-500 leading-6 mt-4">
                O seu chamado #{code} foi criado com sucesso. Você pode
                acompanhar o progresso e atualizações do chamado clicando no
                botão abaixo.
              </Text>

              <Button
                className="bg-orange-500 text-white px-8 py-3 rounded-md mb-4 mt-4"
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/cliente/chamado/${code}`}
              >
                Acessar detalhes do chamado
              </Button>

              <Hr />

              <Text className="text-xs text-zinc-500 mt-6">
                TechSupport - Sistema de Chamado
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
